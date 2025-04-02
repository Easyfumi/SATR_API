package ru.marinin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.marinin.model.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    public List<Task> findByAssignedUserId(Long id);
}
