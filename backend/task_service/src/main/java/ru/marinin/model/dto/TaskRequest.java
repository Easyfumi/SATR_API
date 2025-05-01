package ru.marinin.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class TaskRequest {
    private String type;
    private Long applicantId;
    private Long manufacturerId;
    private List<String> categories;
    private String mark;
    private String typeName;
    private String procedure;
    private Long representativeId;
    private Long createdBy;
    private Long assignedUserId;
    private String status;
    private LocalDate decisionAt;
    private Boolean paymentStatus;
}