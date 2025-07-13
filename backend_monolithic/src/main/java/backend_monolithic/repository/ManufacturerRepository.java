package backend_monolithic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import backend_monolithic.model.Manufacturer;

import java.util.List;
import java.util.Optional;

public interface ManufacturerRepository extends JpaRepository<Manufacturer, Long> {
    List<Manufacturer> findByNameContainingIgnoreCase(String query);

    Optional<Manufacturer> findByName(String manufacturerName);
}
