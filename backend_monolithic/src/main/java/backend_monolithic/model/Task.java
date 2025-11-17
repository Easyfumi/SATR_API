package backend_monolithic.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import backend_monolithic.model.Representative;
import backend_monolithic.model.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    @ManyToOne
    @JoinColumn(name = "contract_id")
    @JsonBackReference // Добавляем для корректной сериализации
    private Contract contract;

    // Хелпер-метод для установки контракта
    public void setContract(Contract contract) {
        this.contract = contract;
        if (contract != null && !contract.getTasks().contains(this)) {
            contract.getTasks().add(this);
        }
    }
}
