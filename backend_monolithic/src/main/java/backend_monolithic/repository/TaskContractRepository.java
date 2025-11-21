package backend_monolithic.repository;

import backend_monolithic.model.TaskContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskContractRepository extends JpaRepository<TaskContract, Long> {

    Optional<TaskContract> findByTaskIdAndContractId(Long taskId, Long contractId);

    List<TaskContract> findByTaskId(Long taskId);

    List<TaskContract> findByContractId(Long contractId);

    boolean existsByTaskIdAndContractId(Long taskId, Long contractId);

    @Modifying
    @Query("DELETE FROM TaskContract tc WHERE tc.task.id = :taskId AND tc.contract.id = :contractId")
    void deleteByTaskIdAndContractId(@Param("taskId") Long taskId, @Param("contractId") Long contractId);

    @Query("SELECT tc FROM TaskContract tc JOIN FETCH tc.contract WHERE tc.task.id = :taskId")
    List<TaskContract> findByTaskIdWithContract(@Param("taskId") Long taskId);

    @Query("SELECT tc FROM TaskContract tc JOIN FETCH tc.task WHERE tc.contract.id = :contractId")
    List<TaskContract> findByContractIdWithTask(@Param("contractId") Long contractId);
}
