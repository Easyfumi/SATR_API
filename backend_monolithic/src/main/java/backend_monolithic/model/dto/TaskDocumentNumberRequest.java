package backend_monolithic.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskDocumentNumberRequest {
    @NotBlank(message = "Номер документа не может быть пустым")
    private String documentNumber;
}
