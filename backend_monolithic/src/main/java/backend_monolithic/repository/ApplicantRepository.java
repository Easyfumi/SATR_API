package backend_monolithic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import backend_monolithic.model.Applicant;

import java.util.List;
import java.util.Optional;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    List<Applicant> findByNameContainingIgnoreCase(String query);

    Optional<Applicant> findByName(String applicantName);
}
