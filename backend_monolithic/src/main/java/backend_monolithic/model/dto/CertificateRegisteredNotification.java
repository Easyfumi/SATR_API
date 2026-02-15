package backend_monolithic.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificateRegisteredNotification {
    private String recipientEmail;
    private String recipientName;
    private String applicationNumber;
    private LocalDate applicationDate;
    private String applicantName;
    private String certificateNumber;
    private String executorName;
}

