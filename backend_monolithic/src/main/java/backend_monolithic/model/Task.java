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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id")
    private Applicant applicant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturer_id")
    private Manufacturer manufacturer;

    @ElementCollection
    private List<String> categories;

    private String mark;
    private String typeName;
    private String processType;
    private String previousNumber;
    private String previousProcessType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_id")
    private Representative representative;

    // СВЯЗЬ ONE-TO-MANY: У задачи может быть только один договор
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id") // Внешний ключ в таблице tasks
    private Contract contract;

    private Long createdBy;
    private Long assignedUserId;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    private LocalDateTime createdAt;
    private LocalDate decisionAt;

    // Убираем TaskContract, так как теперь связь прямая
    // @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<TaskContract> taskContracts = new ArrayList<>();

    // Хелпер-методы для работы со связью с Contract
    public void setContract(Contract contract) {
        // Отвязываем от старого договора
        if (this.contract != null) {
            this.contract.getTasks().remove(this);
        }

        // Устанавливаем новую связь
        this.contract = contract;
        if (contract != null && !contract.getTasks().contains(this)) {
            contract.getTasks().add(this);
        }
    }

    // Метод для удобного получения информации о договоре
    public String getContractInfo() {
        return contract != null ?
                String.format("%s от %s", contract.getNumber(), contract.getDate()) :
                "Договор не назначен";
    }
}
