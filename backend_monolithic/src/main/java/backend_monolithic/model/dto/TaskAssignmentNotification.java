package backend_monolithic.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignmentNotification {
    private String recipientEmail;
    private String recipientName;
    private Long taskId;
    private String taskNumber;
    private String message;
}
