package ru.marinin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.marinin.model.dto.TaskRequest;
import ru.marinin.model.enums.TaskStatus;
import ru.marinin.model.enums.VehicleCategories;

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
