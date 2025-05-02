package ru.marinin.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "manufacturers")
public class Manufacturer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;
    // Дополнительные поля
}
