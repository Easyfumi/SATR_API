package backend_monolithic.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TaskSimple {
    private Long id;
    private String number;
    private String docType;
    private String applicantName;
    private String typeName;
    private String processType;
    private String previousProcessType;
    private String assignedUserName;
    private String status;
    private LocalDateTime createdAt;
}
