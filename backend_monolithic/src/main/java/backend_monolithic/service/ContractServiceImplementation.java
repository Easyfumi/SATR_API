package backend_monolithic.service;

import backend_monolithic.error.BusinessException;
import backend_monolithic.model.Applicant;
import backend_monolithic.model.Contract;
import backend_monolithic.model.Task;
import backend_monolithic.model.User;
import backend_monolithic.model.dto.ContractRequest;
import backend_monolithic.model.enums.PaymentStatus;
import backend_monolithic.repository.ApplicantRepository;
import backend_monolithic.repository.ContractRepository;
import backend_monolithic.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractServiceImplementation implements ContractService {

    private final ContractRepository contractRepository;
    private final TaskRepository taskRepository;
    private final ApplicantRepository applicantRepository;
    private final UserService userService;

    @Override
    public List<Contract> findAll() {
        return contractRepository.findAll();
    }

    @Override
    public Optional<Contract> findById(Long id) {
        return contractRepository.findByIdWithTasks(id);
    }

    @Override
    @Transactional
    public Contract save(ContractRequest request, String jwt) {
        if (contractRepository.existsByNumber(request.getNumber())) {
            throw new BusinessException("Договор с номером " + request.getNumber() + " уже существует");
        }

        Contract contract = new Contract();
        User user = userService.getUserProfile(jwt);

        contract.setCreatedBy(user.getId());
        contract.setCreatedAt(LocalDateTime.now());
        contract.setNumber(request.getNumber());
        contract.setDate(request.getDate());
        contract.setPaymentStatus(request.getPaymentStatus());
        contract.setComments(request.getComments());

        if (request.getApplicantName() != null && !request.getApplicantName().isEmpty()) {
            Applicant applicant = getOrCreateApplicant(request.getApplicantName());
            contract.setApplicant(applicant);
        }

        return contractRepository.save(contract);
    }

    @Override
    @Transactional
    public Contract update(Long id, ContractRequest contractDetails) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));

        if (!contract.getNumber().equals(contractDetails.getNumber()) &&
                contractRepository.existsByNumber(contractDetails.getNumber())) {
            throw new BusinessException("Договор с номером " + contractDetails.getNumber() + " уже существует");
        }

        contract.setNumber(contractDetails.getNumber());
        contract.setDate(contractDetails.getDate());
        contract.setPaymentStatus(contractDetails.getPaymentStatus());
        contract.setComments(contractDetails.getComments());

        if (contractDetails.getApplicantName() != null && !contractDetails.getApplicantName().isEmpty()) {
            Applicant applicant = getOrCreateApplicant(contractDetails.getApplicantName());
            contract.setApplicant(applicant);
        } else {
            contract.setApplicant(null);
        }

        return contractRepository.save(contract);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));

        // Отвязываем все задачи от этого договора
        for (Task task : contract.getTasks()) {
            task.setContract(null);
        }

        contractRepository.delete(contract);
    }

    @Override
    @Transactional
    public Contract updateComments(Long id, String comments) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));
        contract.setComments(comments);
        return contractRepository.save(contract);
    }

    @Override
    @Transactional
    public Contract updatePaymentStatus(Long id, PaymentStatus paymentStatus) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));
        contract.setPaymentStatus(paymentStatus);
        return contractRepository.save(contract);
    }

    @Override
    public List<Task> findTasksWithoutContract() {
        return taskRepository.findByContractIsNull();
    }

    @Override
    @Transactional
    public void addTasksToContract(Long contractId, List<Long> taskIds) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));

        List<Task> tasks = taskRepository.findAllById(taskIds);

        if (tasks.size() != taskIds.size()) {
            throw new EntityNotFoundException("Некоторые задачи не найдены");
        }

        // Устанавливаем договор для каждой задачи
        for (Task task : tasks) {
            task.setContract(contract);
        }

        taskRepository.saveAll(tasks);
    }

    @Override
    @Transactional
    public void removeTasksFromContract(Long contractId, List<Long> taskIds) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));

        List<Task> tasks = taskRepository.findAllById(taskIds);

        // Удаляем связь только если задача привязана к этому договору
        for (Task task : tasks) {
            if (contract.equals(task.getContract())) {
                task.setContract(null);
            }
        }

        taskRepository.saveAll(tasks);
    }

    // Вспомогательные методы

    private Applicant getOrCreateApplicant(String applicantName) {
        return applicantRepository.findByName(applicantName)
                .orElseGet(() -> {
                    Applicant newApplicant = new Applicant(applicantName);
                    return applicantRepository.save(newApplicant);
                });
    }
}
