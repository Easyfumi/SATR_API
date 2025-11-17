package backend_monolithic.model.dto;

import backend_monolithic.model.enums.PaymentStatus;
import lombok.Data;
import org.springframework.util.StopWatch;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContractResponse {
    private Long id;
    private String number;
    private LocalDate date;
    private String applicantName;
    private PaymentStatus paymentStatus;
    private String comments;
    private Long createdBy;
    private LocalDateTime createdAt;
    private List<StopWatch.TaskInfo> tasks; // Добавляем список задач
}