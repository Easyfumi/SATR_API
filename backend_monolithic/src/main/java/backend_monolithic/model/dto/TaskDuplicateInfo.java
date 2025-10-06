package backend_monolithic.model.dto;
import backend_monolithic.model.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TaskDuplicateInfo {
    private Long id;
    private String displayIdentifier; // Отображаемый идентификатор
    private TaskStatus status;
    private LocalDateTime createdAt;
}