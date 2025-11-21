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
public class LinkResponse {
    private Long id;
    private Long taskId;
    private Long contractId;
    private String taskNumber;
    private TaskStatus taskStatus;
    private String contractNumber;
    private LocalDate contractDate;
    private PaymentStatus paymentStatus;
    private LocalDateTime linkedAt;
    private Long linkedBy;
    private String linkComment;
    private Boolean active;
}
