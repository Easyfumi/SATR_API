package backend_monolithic.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDecisionNotification {
    private String recipientEmail;
    private String recipientName;
    private Long taskId;
    private String taskNumber;
    private LocalDate decisionDate;
    private String applicantName;
}
