package ru.marinin.model;

import java.time.LocalDateTime;
import java.util.List;

public class TaskDto {
    private String title;

    private String description;

    private String image;

    private Long assignedUserId;

    private List<String> tags;

    private TaskStatus status;

    private LocalDateTime deadLine;

    private LocalDateTime createdAt;
}
