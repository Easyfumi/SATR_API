package backend_monolithic.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class TaskRequest {
    private String docType;
    private String applicantName;
    private String manufacturerName;
    private List<String> categories;
    private String mark;
    private String typeName;
    private String processType;
    private String previousNumber;
    private String previousProcessType;
    private String representativeName;
    private Long assignedUserId;
    private Long contractId;
}