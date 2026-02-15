package backend_monolithic.model.dto;

import backend_monolithic.model.enums.CertificateStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CertificateDuplicateInfo {
    private Long id;
    private String displayIdentifier;
    private CertificateStatus status;
    private LocalDateTime createdAt;
}

