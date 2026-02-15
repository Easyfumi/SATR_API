package backend_monolithic.model.dto;

import backend_monolithic.model.enums.DeclarationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeclarationStatusUpdateRequest {
    @NotNull(message = "Статус обязателен")
    private DeclarationStatus status;

    private String declarationNumber;
}
