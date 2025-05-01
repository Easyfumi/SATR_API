package ru.marinin.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Applicant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true) // Запрет дубликатов
    private String name;
    // Дополнительные поля (адрес, контакты и т.д.)
}
