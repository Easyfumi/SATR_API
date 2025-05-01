package ru.marinin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.marinin.model.Task;
import ru.marinin.model.enums.TaskStatus;
import ru.marinin.model.enums.VehicleCategories;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    public List<Task> findByAssignedUserId(Long id);

    @Query("SELECT t FROM Task t WHERE " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:categories IS NULL OR t.categories IN :categories)")
    List<Task> findByFilters(
            @Param("status") TaskStatus status,
            @Param("categories") List<VehicleCategories> categories);
}
