package backend_monolithic.repository;

import backend_monolithic.model.Certificate;
import backend_monolithic.model.enums.CertificateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    boolean existsByNumberAndApplicationDateGreaterThanEqualAndApplicationDateLessThan(
            String number,
            LocalDate yearStart,
            LocalDate nextYearStart
    );
    boolean existsByCertificateNumber(String certificateNumber);
    boolean existsByCertificateNumberAndIdNot(String certificateNumber, Long id);

    List<Certificate> findByStatusNot(CertificateStatus status);

    List<Certificate> findByAssignedUserIdOrRegisteredByUserIdOrderByCreatedAtDesc(Long assignedUserId, Long registeredByUserId);

    @Query("""
            select count(distinct c.id)
            from Certificate c
            where (c.assignedUserId = :userId or c.registeredByUserId = :userId)
              and c.status not in :statuses
            """)
    long countActiveByUser(@Param("userId") Long userId, @Param("statuses") Collection<CertificateStatus> statuses);

    long countByRegisteredByUserIdAndCertificateRegisteredAtBetween(
            Long registeredByUserId,
            LocalDate start,
            LocalDate end
    );
}

