package backend_monolithic.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskNumberRequest {
    @NotBlank(message = "Номер не может быть пустым")
    private String number;

    @NotNull(message = "Дата заявки обязательна")
    private LocalDate applicationDate;
}
