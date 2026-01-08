package backend_monolithic.repository;

import backend_monolithic.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByNumber(String number);
    boolean existsByNumber(String number);

    @Query("SELECT DISTINCT c FROM Contract c LEFT JOIN FETCH c.tasks WHERE c.id = :id")
    Optional<Contract> findByIdWithTasks(@Param("id") Long id);

    @Query("SELECT DISTINCT c FROM Contract c LEFT JOIN FETCH c.applicant WHERE c.id = :id")
    Optional<Contract> findByIdWithApplicant(@Param("id") Long id);
}
