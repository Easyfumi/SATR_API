package backend_monolithic.repository;

import backend_monolithic.model.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import backend_monolithic.model.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Boolean existsByNumber(String number);

    List<Task> findByStatusNot(TaskStatus status);


}
