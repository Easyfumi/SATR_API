package backend_monolithic.service;

import backend_monolithic.model.Task;
import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.TaskStatus;
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

    TaskResponse updateStatus(Long taskId, TaskStatus newStatus);

    PageResponse<TaskResponse> getFilteredTasks(TaskFilter filter, String jwt, int page, int size);


    TaskResponse updateTask(Long taskId, TaskRequest request);

}
