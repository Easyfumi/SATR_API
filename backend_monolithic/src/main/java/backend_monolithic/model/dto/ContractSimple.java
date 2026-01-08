package backend_monolithic.model.dto;

import backend_monolithic.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractSimple {
    private Long id;
    private String number;
    private LocalDate date;
    private PaymentStatus paymentStatus;
    private String applicantName;
}
