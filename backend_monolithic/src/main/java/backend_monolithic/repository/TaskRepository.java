package backend_monolithic.repository;

import backend_monolithic.model.Task;
import backend_monolithic.model.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    boolean existsByNumber(String number);

    List<Task> findByStatusNot(TaskStatus status);

    // Находим задачи без договора (One-to-Many)
    List<Task> findByContractIsNull();

    // Находим задачи по договору (One-to-Many)
    List<Task> findByContractId(Long contractId);

    // Метод для фильтрации с использованием спецификаций и пагинации
    Page<Task> findAll(Specification<Task> spec, Pageable pageable);

    // Методы для фильтрации со спецификациями
    List<Task> findAll(Specification<Task> spec);
    List<Task> findAll(Specification<Task> spec, Sort sort);

    // Загружаем задачу с договором (One-to-Many)
    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN FETCH t.contract WHERE t.id = :id")
    Optional<Task> findByIdWithContract(@Param("id") Long id);

    // Находим задачи по нескольким ID
    List<Task> findByIdIn(List<Long> ids);

    // Находим задачи по заявителю
    @Query("SELECT t FROM Task t WHERE t.applicant.id = :applicantId")
    List<Task> findByApplicantId(@Param("applicantId") Long applicantId);

    // Находим задачи по производителю
    @Query("SELECT t FROM Task t WHERE t.manufacturer.id = :manufacturerId")
    List<Task> findByManufacturerId(@Param("manufacturerId") Long manufacturerId);

    // Находим задачи по статусу
    List<Task> findByStatus(TaskStatus status);

    // Находим задачи, созданные после указанной даты
    List<Task> findByCreatedAtAfter(java.time.LocalDateTime date);

    // Находим задачи, созданные до указанной даты
    List<Task> findByCreatedAtBefore(java.time.LocalDateTime date);

    // Находим задачи по диапазону дат создания
    List<Task> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}