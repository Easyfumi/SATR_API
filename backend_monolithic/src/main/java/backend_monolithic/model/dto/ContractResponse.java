package backend_monolithic.model.dto;

import backend_monolithic.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {
    private Long id;
    private String number;
    private LocalDate date;
    private String applicantName;
    private PaymentStatus paymentStatus;
    private String comments;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
}