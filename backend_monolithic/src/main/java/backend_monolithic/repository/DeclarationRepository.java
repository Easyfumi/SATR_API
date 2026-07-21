package backend_monolithic.repository;

import backend_monolithic.model.Declaration;
import backend_monolithic.model.enums.DeclarationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface DeclarationRepository extends JpaRepository<Declaration, Long> {
    boolean existsByNumberAndApplicationDateGreaterThanEqualAndApplicationDateLessThan(
            String number,
            LocalDate yearStart,
            LocalDate nextYearStart
    );
    boolean existsByDeclarationNumber(String declarationNumber);
    boolean existsByDeclarationNumberAndIdNot(String declarationNumber, Long id);

    List<Declaration> findByStatusNot(DeclarationStatus status);

    List<Declaration> findByAssignedUserIdOrderByCreatedAtDesc(Long assignedUserId);

    long countByAssignedUserIdAndStatusNot(Long assignedUserId, DeclarationStatus status);

    long countByAssignedUserIdAndStatusNotIn(Long assignedUserId, Collection<DeclarationStatus> statuses);

    long countByAssignedUserIdAndDeclarationRegisteredAtBetween(Long assignedUserId, LocalDate start, LocalDate end);
}
