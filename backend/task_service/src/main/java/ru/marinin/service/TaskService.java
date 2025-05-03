package ru.marinin.service;

import ru.marinin.model.Task;
import ru.marinin.model.dto.TaskRequest;
import ru.marinin.model.dto.TaskResponse;

import java.util.List;

public interface TaskService {
    TaskResponse createTask(TaskRequest request, String jwt);
    List<TaskResponse> getAllTasks();
    TaskResponse getTaskById(Long id);
    TaskResponse updateTask(Long id, TaskRequest request);
    void deleteTask(Long id);
    TaskResponse changeStatus(Long id, String status);
    TaskResponse assignUser(Long id, Long userId);
    List<TaskResponse> filterTasks(String status, List<String> categories);
    TaskResponse setTaskNumber(Long taskId, String number);
}
