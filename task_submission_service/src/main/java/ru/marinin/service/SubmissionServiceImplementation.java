package ru.marinin.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.marinin.model.Submission;
import ru.marinin.repository.SubmissionRepository;

import java.util.List;

@Service
public class SubmissionServiceImplementation implements SubmissionService{

    @Autowired
    private SubmissionRepository submissionRepository;

    @Override
    public Submission submitTask(Long taskId, String comment, Long userId) throws Exception {
        return null;
    }

    @Override
    public List<Submission> getAllTasksSubmissions() {
        return List.of();
    }

    @Override
    public List<Submission> getTaskSubmissionsByTaskId(Long taskId) {
        return List.of();
    }

    @Override
    public Submission acceptDeclineSubmission(Long id, String status) throws Exception {
        return null;
    }
}
