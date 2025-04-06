package ru.marinin.service;

import ru.marinin.model.Submission;

import java.util.List;

public interface SubmissionService {

    Submission submitTask(Long taskId, String comment, Long userId) throws Exception;

    List<Submission> getAllTasksSubmissions();

    List<Submission> getTaskSubmissionsByTaskId(Long taskId);

    Submission acceptDeclineSubmission(Long id, String status) throws Exception;
}
