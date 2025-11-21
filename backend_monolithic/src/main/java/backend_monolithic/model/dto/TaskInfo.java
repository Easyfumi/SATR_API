package backend_monolithic.model.dto;

import backend_monolithic.model.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskInfo {
    private Long id;
    private String number;
    private String docType;
    private String mark;
    private String typeName;
    private TaskStatus status;
    private LocalDateTime createdAt;
}
