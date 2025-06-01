package ru.marinin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "applicants")
@AllArgsConstructor
@NoArgsConstructor
public class Applicant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true) // Запрет дубликатов
    private String name;
    // Дополнительные поля (адрес, контакты и т.д.)


    public Applicant(String name) {
        this.name = name;
    }
}
