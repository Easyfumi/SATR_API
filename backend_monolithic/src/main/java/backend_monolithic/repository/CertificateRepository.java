package backend_monolithic.repository;

import backend_monolithic.model.Certificate;
import backend_monolithic.model.enums.CertificateStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    boolean existsByNumber(String number);
    boolean existsByCertificateNumber(String certificateNumber);
    boolean existsByCertificateNumberAndIdNot(String certificateNumber, Long id);

    List<Certificate> findByStatusNot(CertificateStatus status);

    List<Certificate> findByAssignedUserIdOrderByCreatedAtDesc(Long assignedUserId);
}

