package ru.marinin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.marinin.model.Submission;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByTaskId(Long taskId);
}
