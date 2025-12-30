package backend_monolithic.service;

import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.TaskStatus;

import java.time.LocalDate;
import java.util.List;

public interface TaskService {
    TaskResponse createTask(TaskRequest request, String jwt);
    TaskResponse getTaskById(Long id);
    List<TaskResponse> getAllTasks(String jwt);
    PageResponse<TaskResponse> getFilteredTasks(TaskFilter filter, String jwt, int page, int size);
    TaskResponse updateTask(Long taskId, TaskRequest request);
    TaskResponse updateStatus(Long taskId, TaskStatus newStatus);
    TaskResponse setTaskNumber(Long taskId, String number);
    TaskResponse setDecisionDate(Long taskId, LocalDate decisionDate);
    TaskResponse updateTaskContract(Long taskId, Long contractId);
    List<TaskDuplicateInfo> checkDuplicates(TaskRequest request);
}
