package backend_monolithic.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskDecisionDateRequest {
    @NotNull
    private LocalDate decisionDate;
}
