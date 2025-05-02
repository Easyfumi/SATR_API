package ru.marinin.model;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "representatives")
public class Representative {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

//    @ManyToOne // Связь с изготовителем (опционально)
//    private Manufacturer manufacturer;


}