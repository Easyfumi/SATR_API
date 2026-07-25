package backend_monolithic.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDocumentNumberAssignedNotification {
    private String recipientEmail;
    private String recipientName;
    private Long taskId;
    private String applicationNumber;
    private String documentNumber;
    private String docType;
    private String applicantName;
    private String executorName;
}
