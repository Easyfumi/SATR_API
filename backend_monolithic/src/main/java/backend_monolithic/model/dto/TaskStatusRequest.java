package backend_monolithic.model.dto;

import backend_monolithic.model.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskStatusRequest {
    @NotNull(message = "Статус обязателен")
    private TaskStatus status;
}
