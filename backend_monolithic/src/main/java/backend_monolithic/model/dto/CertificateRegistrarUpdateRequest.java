package backend_monolithic.model.dto;

import lombok.Data;

@Data
public class CertificateRegistrarUpdateRequest {
    private Long registeredByUserId;
}
