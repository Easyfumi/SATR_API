package backend_monolithic.service;

import backend_monolithic.model.Applicant;
import backend_monolithic.model.Contract;
import backend_monolithic.model.Task;
import backend_monolithic.model.dto.ContractRequest;
import backend_monolithic.repository.ApplicantRepository;
import backend_monolithic.repository.ContractRepository;
import backend_monolithic.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ContractServiceImplementation implements ContractService {
    private final ContractRepository contractRepository;
    private final TaskRepository taskRepository;
    private final ApplicantRepository applicantRepository;

    public List<Contract> findAll() {
        return contractRepository.findAll();
    }

    public Optional<Contract> findById(Long id) {
        return contractRepository.findById(id);
    }

    public Contract save(ContractRequest request) {
        // Проверка уникальности номера
        if (contractRepository.existsByNumber(request.getNumber())) {
            throw new RuntimeException("Contract with number " + request.getNumber() + " already exists");
        }

        Contract contract = new Contract();
        contract.setNumber(request.getNumber());
        contract.setDate(request.getDate());
        contract.setPaymentStatus(request.getPaymentStatus());
        contract.setComments(request.getComments());

        // Обработка заявителя: найти или создать
        if (request.getApplicantName() != null && !request.getApplicantName().isEmpty()) {
            Applicant applicant = getOrCreateApplicant(request.getApplicantName());
            contract.setApplicant(applicant);
        }
        return contractRepository.save(contract);
    }

        public Applicant getOrCreateApplicant(String applicantName) {
            return applicantRepository.findByName(applicantName)
                    .orElseGet(() -> {
                        Applicant newApplicant = new Applicant(applicantName);
                        return applicantRepository.save(newApplicant);
                    });
        }

    public Contract update(Long id, ContractRequest contractDetails) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));

        if (!contract.getNumber().equals(contractDetails.getNumber()) &&
                contractRepository.existsByNumber(contractDetails.getNumber())) {
            throw new RuntimeException("Contract with number " + contractDetails.getNumber() + " already exists");
        }

        contract.setNumber(contractDetails.getNumber());
        contract.setDate(contractDetails.getDate());
        contract.setPaymentStatus(contractDetails.getPaymentStatus());
        contract.setComments(contractDetails.getComments());

        // Обновление заявителя
        if (contractDetails.getApplicantName() != null && !contractDetails.getApplicantName().isEmpty()) {
            Applicant applicant = getOrCreateApplicant(contractDetails.getApplicantName());
            contract.setApplicant(applicant);
        } else {
            contract.setApplicant(null);
        }

        // Обновление задачи
        if (contractDetails.getTaskId() != null) {
            Task task = taskRepository.findById(contractDetails.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found with id: " + contractDetails.getTaskId()));
            contract.setTasks(task);
        } else {
            contract.setTasks(null);
        }

        return contractRepository.save(contract);
    }

    @Override
    public void deleteById(Long id) {

    }
}
