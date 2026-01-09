package backend_monolithic.model.dto;

import backend_monolithic.model.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskStatusUpdateRequest {
    @NotNull(message = "Статус обязателен")
    private TaskStatus status;
}
