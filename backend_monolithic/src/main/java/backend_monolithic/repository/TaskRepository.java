package backend_monolithic.repository;

import backend_monolithic.model.enums.TaskStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import backend_monolithic.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    Boolean existsByNumber(String number);
    List<Task> findByStatusNot(TaskStatus status);

    // Метод для фильтрации с использованием спецификаций и пагинации
    Page<Task> findAll(Specification<Task> spec, Pageable pageable);

    // Остальные методы остаются
    List<Task> findAll(Specification<Task> spec);
    List<Task> findAll(Specification<Task> spec, Sort sort);

    // УДАЛЯЕМ старые методы, которые используют прямую связь с contract
    // @Query("SELECT t FROM Task t LEFT JOIN FETCH t.contract WHERE t.id = :taskId")
    // Optional<Task> findByIdWithContract(@Param("taskId") Long taskId);

    // List<Task> findByContractId(Long contractId);

    // УДАЛЯЕМ старый метод для поиска задач без привязанного контракта
    // List<Task> findByContractIsNull();

    // НОВЫЕ методы для работы с many-to-many связью
    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.taskContracts tc LEFT JOIN FETCH tc.contract WHERE t.id = :id")
    Optional<Task> findByIdWithContracts(@Param("id") Long id);

    @Query("SELECT t FROM Task t WHERE t.id NOT IN (SELECT tc.task.id FROM TaskContract tc)")
    List<Task> findTasksWithoutContracts();

    // Метод для поиска задач по ID договора через связь many-to-many
    @Query("SELECT t FROM Task t JOIN t.taskContracts tc WHERE tc.contract.id = :contractId")
    List<Task> findByContractId(@Param("contractId") Long contractId);
}
