package backend_monolithic.service;

import backend_monolithic.model.Contract;

import java.util.List;
import java.util.Optional;

public interface ContractService {
    List<Contract> findAll();
    Optional<Contract> findById(Long id);
    Contract save(Contract contract);
    Contract update(Long id, Contract contractDetails);
    void deleteById(Long id);
}
