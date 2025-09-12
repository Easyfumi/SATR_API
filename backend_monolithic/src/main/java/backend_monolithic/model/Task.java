package backend_monolithic.model;

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
    private String number;   //  номер заявки, присваивается при регистрации

    private String docType;   // ОТТС/ОТШ

    @ManyToOne
    private Applicant applicant;   // заявитель

    @ManyToOne
    private Manufacturer manufacturer;   // изготовитель

    private List<String> categories;   // категории

    private String mark;  // марка

    private String typeName;  // наименование типа

    private String processType;  // процедура

    private String previousNumber; // номер предыдущего / процедура

    private String previousProcessType;  // процедура распространения?

    @ManyToOne
    private Representative representative;  // представитель изготовителя

    private Long createdBy;   // кем создана

    private Long assignedUserId;   // назначен для работы по заявке

    private TaskStatus status;   // статус

    private LocalDateTime createdAt;   // дата время создания заявки
    
    private LocalDate decisionAt;   // дата решения по заявке

    private Boolean paymentStatus=false;  // статус оплаты

}
