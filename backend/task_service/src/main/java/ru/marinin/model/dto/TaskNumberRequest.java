package ru.marinin.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskNumberRequest {
    @NotBlank(message = "Номер не может быть пустым")
    private String number;
}
