package backend_monolithic.repository;

import backend_monolithic.model.enums.TaskStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import backend_monolithic.model.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Boolean existsByNumber(String number);
    List<Task> findByStatusNot(TaskStatus status);

    // Метод для фильтрации с использованием спецификаций
    List<Task> findAll(Specification<Task> spec);

    // Метод для фильтрации с сортировкой
    List<Task> findAll(Specification<Task> spec, Sort sort);
}
