package backend_monolithic.model.dto;
import backend_monolithic.model.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TaskDuplicateInfo {
    private Long id;
    private String taskNumber;
    private TaskStatus status;
}