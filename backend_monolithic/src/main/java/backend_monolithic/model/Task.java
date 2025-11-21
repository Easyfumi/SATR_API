package backend_monolithic.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import backend_monolithic.model.Representative;
import backend_monolithic.model.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String number;

    private String docType;

    @ManyToOne
    private Applicant applicant;

    @ManyToOne
    private Manufacturer manufacturer;

    @ElementCollection
    private List<String> categories;

    private String mark;
    private String typeName;
    private String processType;
    private String previousNumber;
    private String previousProcessType;

    @ManyToOne
    private Representative representative;

    private Long createdBy;
    private Long assignedUserId;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private LocalDate decisionAt;

    // Убираем прямую связь с Contract, заменяем на связь через TaskContract
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("task-contract")
    private List<TaskContract> taskContracts = new ArrayList<>();

    // Хелпер-методы для работы со связями
    public void addContract(Contract contract, Long linkedBy, String comment) {
        TaskContract taskContract = new TaskContract();
        taskContract.setTask(this);
        taskContract.setContract(contract);
        taskContract.setLinkedBy(linkedBy);
        taskContract.setLinkComment(comment);
        this.taskContracts.add(taskContract);
        contract.getTaskContracts().add(taskContract);
    }

    public void removeContract(Contract contract) {
        TaskContract taskContract = this.taskContracts.stream()
                .filter(tc -> tc.getContract().equals(contract))
                .findFirst()
                .orElse(null);
        if (taskContract != null) {
            this.taskContracts.remove(taskContract);
            contract.getTaskContracts().remove(taskContract);
            taskContract.setTask(null);
            taskContract.setContract(null);
        }
    }

    public List<Contract> getContracts() {
        return this.taskContracts.stream()
                .map(TaskContract::getContract)
                .collect(Collectors.toList());
    }
}
