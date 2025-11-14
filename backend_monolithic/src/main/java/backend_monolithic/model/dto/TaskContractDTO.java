package backend_monolithic.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskContractDTO {
    @NotNull(message = "Contract ID cannot be null")
    private Long contractId;

    private String contractNumber; // опционально, для информации
}