package backend_monolithic.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LinkRequest {
    @NotNull(message = "Task ID is required")
    private Long taskId;

    @NotNull(message = "Contract ID is required")
    private Long contractId;

    private String comment;
}
