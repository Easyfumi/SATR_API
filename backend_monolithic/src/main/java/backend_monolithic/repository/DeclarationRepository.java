package backend_monolithic.repository;

import backend_monolithic.model.Declaration;
import backend_monolithic.model.enums.DeclarationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeclarationRepository extends JpaRepository<Declaration, Long> {
    boolean existsByNumber(String number);
    boolean existsByDeclarationNumber(String declarationNumber);
    boolean existsByDeclarationNumberAndIdNot(String declarationNumber, Long id);

    List<Declaration> findByStatusNot(DeclarationStatus status);

    List<Declaration> findByAssignedUserIdOrderByCreatedAtDesc(Long assignedUserId);
}
