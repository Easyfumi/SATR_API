package backend_monolithic.model.dto;

import backend_monolithic.model.enums.CertificateStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CertificateStatusUpdateRequest {
    @NotNull(message = "Статус обязателен")
    private CertificateStatus status;

    private String certificateNumber;
}

