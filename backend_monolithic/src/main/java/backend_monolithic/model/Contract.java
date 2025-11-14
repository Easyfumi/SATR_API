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

    @ManyToOne
    private Applicant applicant;   // заявитель

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL)
    @JsonIgnore // чтобы избежать циклических ссылок при сериализации
    private List<Task> tasks = new ArrayList<>();

    private String comments;

    private Long createdBy;

    private LocalDateTime createdAt;
}
