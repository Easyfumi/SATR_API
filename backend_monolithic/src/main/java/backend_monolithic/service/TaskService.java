package backend_monolithic.service;

import backend_monolithic.model.dto.TaskRequest;
import backend_monolithic.model.dto.TaskResponse;

import java.util.List;

public interface TaskService {
    TaskResponse createTask(TaskRequest request, String jwt);

    List<TaskResponse> getAllTasks(String jwt);

    TaskResponse getTaskById(Long id);

    TaskResponse setTaskNumber(Long taskId, String number);

//    TaskResponse assignUser(Long id, Long userId);
//    List<TaskResponse> filterTasks(String status, List<String> categories);
//    TaskResponse updateTask(Long id, TaskRequest request);
//    void deleteTask(Long id);
//    TaskResponse changeStatus(Long id, String status);

}
