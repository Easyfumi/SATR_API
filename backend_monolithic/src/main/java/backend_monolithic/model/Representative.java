package backend_monolithic.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "representatives")
@AllArgsConstructor
@NoArgsConstructor
public class Representative {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

//    @ManyToOne // Связь с изготовителем (опционально)
//    private Manufacturer manufacturer;


    public Representative(String name) {
        this.name = name;
    }
}