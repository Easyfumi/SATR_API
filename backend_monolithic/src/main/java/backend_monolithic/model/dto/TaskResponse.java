package backend_monolithic.model.dto;

import backend_monolithic.model.Contract;
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
public class TaskResponse {
    private Long id;
    private String number;
    private String docType;
    private String applicant;
    private String manufacturer;
    private List<String> categories;
    private String mark;
    private String typeName;
    private String processType;
    private String previousProcessType;
    private String previousNumber;
    private String representative;
    private LocalDate decisionAt;
    private LocalDateTime createdAt;
    private String status;
    private String createdBy;
    private Long assignedUserId;
    private UserInfo assignedUser;

    // ТЕПЕРЬ ТОЛЬКО ОДИН ДОГОВОР вместо списка!
    private ContractSimple contract;

    // Метод для установки информации о договоре
    public void setContractFromEntity(Contract contract) {
        if (contract != null) {
            this.contract = new ContractSimple();
            this.contract.setId(contract.getId());
            this.contract.setNumber(contract.getNumber());
            this.contract.setDate(contract.getDate());
            this.contract.setPaymentStatus(contract.getPaymentStatus());
            this.contract.setApplicantName(contract.getApplicant() != null ?
                    contract.getApplicant().getName() : null);
        }
    }
}


