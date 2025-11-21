package backend_monolithic.model;

import backend_monolithic.model.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "contracts")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String number;

    private LocalDate date;

    @ManyToOne
    private Applicant applicant;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("contract-task")
    private List<TaskContract> taskContracts = new ArrayList<>();

    private String comments;
    private Long createdBy;
    private LocalDateTime createdAt;

    // Хелпер-методы для работы со связями
    public void addTask(Task task, Long linkedBy, String comment) {
        TaskContract taskContract = new TaskContract();
        taskContract.setContract(this);
        taskContract.setTask(task);
        taskContract.setLinkedBy(linkedBy);
        taskContract.setLinkComment(comment);
        this.taskContracts.add(taskContract);
        task.getTaskContracts().add(taskContract);
    }

    public void removeTask(Task task) {
        TaskContract taskContract = this.taskContracts.stream()
                .filter(tc -> tc.getTask().equals(task))
                .findFirst()
                .orElse(null);
        if (taskContract != null) {
            this.taskContracts.remove(taskContract);
            task.getTaskContracts().remove(taskContract);
            taskContract.setContract(null);
            taskContract.setTask(null);
        }
    }

    public List<Task> getTasks() {
        return this.taskContracts.stream()
                .map(TaskContract::getTask)
                .collect(Collectors.toList());
    }
}
