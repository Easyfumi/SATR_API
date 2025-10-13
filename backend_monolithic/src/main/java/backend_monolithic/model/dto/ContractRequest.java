package backend_monolithic.model.dto;

import backend_monolithic.model.enums.PaymentStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ContractRequest {
    private String number;
    private LocalDate date;
    private PaymentStatus paymentStatus;
    private Long taskId;
    private String applicantName; // Имя заявителя для поиска/создания
    private String comments;
}