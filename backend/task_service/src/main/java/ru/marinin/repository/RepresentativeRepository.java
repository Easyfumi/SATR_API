package ru.marinin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.marinin.model.Representative;

import java.util.List;
import java.util.Optional;

public interface RepresentativeRepository extends JpaRepository<Representative, Long> {
    List<Representative> findByNameContainingIgnoreCase(String query);

    Optional<Representative> findByName(String representativeName);
}
