package backend_monolithic.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DeclarationNumberRequest {
    @NotBlank(message = "Номер не может быть пустым")
    @Pattern(regexp = "\\d+", message = "Номер заявки должен содержать только цифры")
    private String number;

    @NotNull(message = "Дата заявки обязательна")
    private LocalDate applicationDate;
}
