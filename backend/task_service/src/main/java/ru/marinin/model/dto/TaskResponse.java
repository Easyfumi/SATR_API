package ru.marinin.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskResponse {
    private Long id;
    private String number;
    private String docType;
    private String applicant;
    private String manufacturer;
    private List<String> categories;
    private String mark;
    private String typeName;
    private String processType;
    private String representative;
    private String createdBy;
    private Long assignedUserId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDate decisionAt;
    private Boolean paymentStatus;
}


