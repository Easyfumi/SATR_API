package backend_monolithic.service;

import backend_monolithic.model.dto.TaskDuplicateInfo;
import backend_monolithic.model.dto.TaskRequest;
import backend_monolithic.model.dto.TaskResponse;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public interface TaskService {
    TaskResponse createTask(TaskRequest request, String jwt);

    List<TaskResponse> getAllTasks(String jwt);

    TaskResponse getTaskById(Long id);

    TaskResponse setTaskNumber(Long taskId, String number);

    TaskResponse setDecisionDate(Long id, @NotNull LocalDate decisionDate);

    List<TaskDuplicateInfo> checkDuplicates(TaskRequest request);

//    TaskResponse assignUser(Long id, Long userId);
//    List<TaskResponse> filterTasks(String status, List<String> categories);
//    TaskResponse updateTask(Long id, TaskRequest request);
//    void deleteTask(Long id);
//    TaskResponse changeStatus(Long id, String status);

}
