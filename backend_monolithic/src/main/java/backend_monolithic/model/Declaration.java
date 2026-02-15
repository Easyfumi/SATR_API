package backend_monolithic.model;

import backend_monolithic.model.enums.DeclarationStatus;
import jakarta.persistence.*;
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
@Table(name = "declarations")
public class Declaration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String number;

    private LocalDate applicationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id")
    private Applicant applicant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturer_id")
    private Manufacturer manufacturer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_id")
    private Representative representative;

    @ElementCollection
    private List<String> categories;

    private String mark;
    private String typeName;
    private String modifications;
    private String commercialNames;
    private String standardSection;

    private Long assignedUserId;
    private Long createdBy;
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private DeclarationStatus status;

    @Column(unique = true)
    private String declarationNumber;
    private LocalDate declarationRegisteredAt;
}
