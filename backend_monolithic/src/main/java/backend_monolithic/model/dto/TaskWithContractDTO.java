package backend_monolithic.model.dto;

import backend_monolithic.model.enums.PaymentStatus;
import backend_monolithic.model.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskWithContractDTO {
    private Long id;
    private String number;
    private String docType;
    private String mark;
    private String typeName;
    private TaskStatus status;
    private LocalDateTime createdAt;

    // Информация о договоре
    private ContractInfoDTO contract;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ContractInfoDTO {
        private Long id;
        private String number;
        private LocalDate date;
        private PaymentStatus paymentStatus;
        private String applicantName; // или полная информация о заявителе
    }
}
