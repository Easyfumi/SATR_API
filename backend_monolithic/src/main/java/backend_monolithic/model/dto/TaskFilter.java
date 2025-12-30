package backend_monolithic.model.dto;

import backend_monolithic.model.enums.TaskStatus;
import lombok.Data;

import java.time.LocalDate;


@Data
public class TaskFilter {
    private String number;
    private String applicant;
    private String manufacturer;
    private String mark;
    private String typeName;
    private String representative;
    private String assignedUser;
    private TaskStatus status;
    private Boolean paymentStatus;
    private LocalDate createdAtFrom;
    private LocalDate createdAtTo;
    private String quickSearch;
    private Boolean hasContract;
    private String contractNumber;
}