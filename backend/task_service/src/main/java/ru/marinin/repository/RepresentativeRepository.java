package ru.marinin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.marinin.model.Representative;

import java.util.List;

public interface RepresentativeRepository extends JpaRepository<Representative, Long> {
    List<Representative> findByNameContainingIgnoreCase(String query);
}
