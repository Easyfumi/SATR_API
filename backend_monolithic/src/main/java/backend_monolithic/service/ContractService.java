package backend_monolithic.service;

import backend_monolithic.model.Applicant;
import backend_monolithic.model.Contract;
import backend_monolithic.model.dto.ContractRequest;

import java.util.List;
import java.util.Optional;

public interface ContractService {
    List<Contract> findAll();
    Optional<Contract> findById(Long id);
    Contract save(ContractRequest request);
    Contract update(Long id, ContractRequest requestDetails);
    void deleteById(Long id);
    Applicant getOrCreateApplicant(String applicantName);
}
