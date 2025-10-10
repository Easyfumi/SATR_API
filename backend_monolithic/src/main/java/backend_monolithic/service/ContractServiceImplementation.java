package backend_monolithic.service;

import backend_monolithic.model.Contract;
import backend_monolithic.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ContractServiceImplementation implements ContractService {
    private final ContractRepository contractRepository;

    public List<Contract> findAll() {
        return contractRepository.findAll();
    }

    public Optional<Contract> findById(Long id) {
        return contractRepository.findById(id);
    }

    public Contract save(Contract contract) {
        if (contractRepository.existsByNumber(contract.getNumber())) {
            throw new RuntimeException("Contract with number " + contract.getNumber() + " already exists");
        }
        return contractRepository.save(contract);
    }

    public Contract update(Long id, Contract contractDetails) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));

        if (!contract.getNumber().equals(contractDetails.getNumber()) &&
                contractRepository.existsByNumber(contractDetails.getNumber())) {
            throw new RuntimeException("Contract with number " + contractDetails.getNumber() + " already exists");
        }

        contract.setNumber(contractDetails.getNumber());
        contract.setPaymentStatus(contractDetails.getPaymentStatus());
        contract.setTasks(contractDetails.getTasks());
        contract.setComments(contractDetails.getComments());

        return contractRepository.save(contract);
    }

    public void deleteById(Long id) {
        if (!contractRepository.existsById(id)) {
            throw new RuntimeException("Contract not found with id: " + id);
        }
        contractRepository.deleteById(id);
    }
}
