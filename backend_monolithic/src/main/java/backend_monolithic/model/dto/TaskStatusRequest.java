package backend_monolithic.model.dto;

import backend_monolithic.model.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class TaskStatusRequest {
    @NotNull(message = "Статус не может быть пустым")
    private TaskStatus status;

    // Конструкторы, геттеры и сеттеры
    public TaskStatusRequest() {}

    public TaskStatusRequest(TaskStatus status) {
        this.status = status;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }
}
