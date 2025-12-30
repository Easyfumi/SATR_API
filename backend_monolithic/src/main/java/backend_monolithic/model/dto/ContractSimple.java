package backend_monolithic.model.dto;

import backend_monolithic.model.enums.PaymentStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ContractSimple {
    private Long id;
    private String number;
    private LocalDate date;
    private PaymentStatus paymentStatus;
    private String applicantName;
}
