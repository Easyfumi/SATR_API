package ru.marinin.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.marinin.model.Submission;
import ru.marinin.model.TaskDto;
import ru.marinin.repository.SubmissionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubmissionServiceImplementation implements SubmissionService{

    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private TaskService taskService;


    @Override
    public Submission submitTask(Long taskId, String comment, Long userId, String jwt) throws Exception {
        TaskDto taskDto = taskService.getTaskById(taskId, jwt);
        if (taskDto!=null) {
            Submission submission = new Submission();
            submission.setTaskId(taskId);
            submission.setUserId(userId);
            submission.setComment(comment);
            submission.setSubmissionTime(LocalDateTime.now());
            return submissionRepository.save(submission);
        }
        throw new Exception("Task not found with id" + taskId);
    }

    @Override
    public List<Submission> getAllTasksSubmissions() {
        return submissionRepository.findAll();
    }

    @Override
    public List<Submission> getTaskSubmissionByTaskId(Long taskId) {
        return submissionRepository.findByTaskId(taskId);
    }

    @Override
    public Submission getTaskSubmissionsById(Long submissionId) throws Exception {
        return submissionRepository.findById(submissionId).orElseThrow(()->new Exception("Task submission not found with id " + submissionId));
    }

    @Override
    public Submission acceptDeclineSubmission(Long id, String status) throws Exception {
        Submission submission = getTaskSubmissionsById(id);
        submission.setStatus(status);
        if (status.equals("ACCEPT")) {
            taskService.completeTask(submission.getTaskId());
        }

        return submissionRepository.save(submission);
    }
}
