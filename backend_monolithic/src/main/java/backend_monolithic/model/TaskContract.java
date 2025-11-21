package backend_monolithic.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_contract")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskContract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @JsonBackReference("task-contract")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    @JsonBackReference("contract-task")
    private Contract contract;

    private LocalDateTime linkedAt;
    private Long linkedBy;

    // Дополнительные поля связи при необходимости
    private String linkComment;
    private Boolean isActive = true;

    @PrePersist
    public void prePersist() {
        this.linkedAt = LocalDateTime.now();
    }
}