package backend_monolithic.service;

import backend_monolithic.model.Applicant;
import backend_monolithic.model.Contract;
import backend_monolithic.model.Task;
import backend_monolithic.model.dto.ContractRequest;
import backend_monolithic.model.enums.PaymentStatus;

import java.util.List;
import java.util.Optional;

public interface ContractService {
    List<Contract> findAll();
    Optional<Contract> findById(Long id);
    Contract save(ContractRequest request, String jwt);
    Contract update(Long id, ContractRequest requestDetails);
    void deleteById(Long id);
    Applicant getOrCreateApplicant(String applicantName);
    Contract updateComments(Long id, String comments);
    public Contract updatePaymentStatus(Long id, PaymentStatus paymentStatus);
    // Task createTaskForContract(Long contractId, Task taskRequest, String jwt);
    Task linkTaskToContract(Long contractId, Long taskId);
    List<Task> findTasksWithoutContract();
}
