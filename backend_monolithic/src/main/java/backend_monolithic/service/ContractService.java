package backend_monolithic.service;

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
    Contract update(Long id, ContractRequest contractDetails);
    void deleteById(Long id);
    Contract updateComments(Long id, String comments);
    Contract updatePaymentStatus(Long id, PaymentStatus paymentStatus);
    List<Task> findTasksWithoutContract();
    void addTasksToContract(Long contractId, List<Long> taskIds);
    void removeTasksFromContract(Long contractId, List<Long> taskIds);
}
