package backend_monolithic.model.dto;

import backend_monolithic.model.enums.DeclarationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DeclarationDuplicateInfo {
    private Long id;
    private String displayIdentifier;
    private DeclarationStatus status;
    private LocalDateTime createdAt;
}
