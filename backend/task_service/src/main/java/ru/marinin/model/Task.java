package ru.marinin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.marinin.model.enums.TaskStatus;
import ru.marinin.model.enums.VehicleCategories;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String number;   //  номер заявки, присваивается при регистрации

    private String type;   // ОТТС/ОТШ

    @ManyToOne
    private Applicant applicant;   // заявитель

    @ManyToOne
    private Manufacturer manufacturer;   // изготовитель

    private List<VehicleCategories> categories;   // категории

    private String mark;  // марка

    private String typeName;  // наименование типа

    private String procedure;  // процедура

    @ManyToOne
    private Representative manufacturersRepresentative;  // представитель изготовителя

    private Long createdBy;   // кем создана

    private Long assignedUserId;   // назначен для работы по заявке

    private TaskStatus status;   // статус

    private LocalDateTime createdAt;   // дата время создания заявки

    private LocalDate decisionAt;   // дата решения по заявке

    private Boolean paymentStatus=false;  // статус оплаты
}
