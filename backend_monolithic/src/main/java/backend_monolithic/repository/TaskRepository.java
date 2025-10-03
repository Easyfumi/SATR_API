package backend_monolithic.repository;

import backend_monolithic.model.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import backend_monolithic.model.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Boolean existsByNumber(String number);

    List<Task> findByStatusNot(TaskStatus status);

//    @Query("SELECT t FROM Task t WHERE " +
//            "(:status IS NULL OR t.status = :status) AND " +
//            "(:categories IS EMPTY OR t.categories IN :categories)")
//    List<Task> findByFilters(
//            @Param("status") TaskStatus status,
//            @Param("categories") List<VehicleCategories> categories);
}
