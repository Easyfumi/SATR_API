package ru.marinin.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private String applicant;   // заявитель

    private String manufacturer;   // изготовитель

    private List<String> categories;   // категории

    private String mark;  // марка

    private String typeName;  // наименование типа

    private String procedure;  // процедура

    private String manufacturersRepresentative;  // представитель изготовителя

    private Long createdBy;   // кем создана

    private Long assignedUserId;   // назначен для работы по заявке

    private TaskStatus status;   // статус

    private LocalDateTime createdAt;   // дата время создания заявки

    private LocalDate decisionAt;   // дата решения по заявке

    private Boolean paymentStatus;  // статус оплаты
}
