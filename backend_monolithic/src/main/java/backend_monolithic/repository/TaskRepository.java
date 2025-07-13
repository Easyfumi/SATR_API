package backend_monolithic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import backend_monolithic.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Boolean existsByNumber(String number);
//    @Query("SELECT t FROM Task t WHERE " +
//            "(:status IS NULL OR t.status = :status) AND " +
//            "(:categories IS EMPTY OR t.categories IN :categories)")
//    List<Task> findByFilters(
//            @Param("status") TaskStatus status,
//            @Param("categories") List<VehicleCategories> categories);
}
