package backend_monolithic.service;

import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.PaymentStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ContractService {
    List<ContractSimple> findAllSimple();
    ContractResponse findById(Long id);
    List<TaskSimple> findContractTasks(Long id);

    @Transactional
    ContractResponse save(ContractRequest request, String jwt);

    @Transactional
    ContractResponse update(Long id, ContractRequest request);

    @Transactional
    void deleteById(Long id);

    @Transactional
    ContractResponse updateComments(Long id, String comments);

    @Transactional
    ContractResponse updatePaymentStatus(Long id, PaymentStatus paymentStatus);
}
