package backend_monolithic.model;

import backend_monolithic.model.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id")
    private Applicant applicant;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JsonIgnore
    private List<Task> tasks = new ArrayList<>();

    private String comments;
    private Long createdBy;
    private LocalDateTime createdAt;

    public void addTask(Task task) {
        if (task == null) return;
        if (!tasks.contains(task)) {
            tasks.add(task);
            task.setContract(this);
        }
    }

    public void removeTask(Task task) {
        if (task == null) return;
        tasks.remove(task);
        if (task.getContract() == this) {
            task.setContract(null);
        }
    }

    public void addTasks(Collection<Task> tasksToAdd) {
        if (tasksToAdd == null) return;
        tasksToAdd.forEach(this::addTask);
    }

    public boolean hasTasks() {
        return tasks != null && !tasks.isEmpty();
    }

    public int getTasksCount() {
        return tasks != null ? tasks.size() : 0;
    }
}
