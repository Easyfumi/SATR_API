package backend_monolithic.model.dto;

import backend_monolithic.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractResponse {
    private Long id;
    private String number;
    private LocalDate date;
    private String applicantName;
    private PaymentStatus paymentStatus;
    private String comments;
    private Long createdBy;
    private LocalDateTime createdAt;
}