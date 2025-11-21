package backend_monolithic.model.dto;

import backend_monolithic.model.Applicant;
import backend_monolithic.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractInfo {
    private Long id;
    private String number;
    private LocalDate date;
    private PaymentStatus paymentStatus;
    private Applicant applicant;
}