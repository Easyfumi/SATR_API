package backend_monolithic.service;

import backend_monolithic.error.BusinessException;
import backend_monolithic.model.dto.*;
import backend_monolithic.model.*;
import backend_monolithic.model.enums.PaymentStatus;
import backend_monolithic.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractServiceImplementation implements ContractService {

    private final ContractRepository contractRepository;
    private final ApplicantRepository applicantRepository;
    private final UserService userService;

    @Override
    public List<ContractSimple> findAllSimple() {
        List<Contract> contracts = contractRepository.findAll();
        return contracts.stream()
                .map(this::convertToContractSimple)
                .collect(Collectors.toList());
    }

    @Override
    public ContractResponse findById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));
        return convertToContractResponse(contract);
    }

    @Override
    public List<TaskSimple> findContractTasks(Long id) {
        Contract contract = contractRepository.findByIdWithTasks(id)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));
        return contract.getTasks().stream()
                .map(this::convertToTaskSimple)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ContractResponse save(ContractRequest request, String jwt) {
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

        Contract savedContract = contractRepository.save(contract);
        return convertToContractResponse(savedContract);
    }

    @Override
    @Transactional
    public ContractResponse update(Long id, ContractRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));

        if (!contract.getNumber().equals(request.getNumber())
                && contractRepository.existsByNumber(request.getNumber())) {
            throw new BusinessException("Договор с номером " + request.getNumber() + " уже существует");
        }

        contract.setNumber(request.getNumber());
        contract.setDate(request.getDate());
        contract.setPaymentStatus(request.getPaymentStatus());
        contract.setComments(request.getComments());

        if (request.getApplicantName() != null && !request.getApplicantName().isEmpty()) {
            Applicant applicant = getOrCreateApplicant(request.getApplicantName());
            contract.setApplicant(applicant);
        } else {
            contract.setApplicant(null);
        }

        Contract updatedContract = contractRepository.save(contract);
        return convertToContractResponse(updatedContract);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!contractRepository.existsById(id)) {
            throw new EntityNotFoundException("Договор не найден");
        }
        contractRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ContractResponse updateComments(Long id, String comments) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));
        contract.setComments(comments);
        Contract updatedContract = contractRepository.save(contract);
        return convertToContractResponse(updatedContract);
    }


    @Override
    @Transactional
    public ContractResponse updatePaymentStatus(Long id, PaymentStatus paymentStatus) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));
        contract.setPaymentStatus(paymentStatus);
        Contract updatedContract = contractRepository.save(contract);
        return convertToContractResponse(updatedContract);
    }

    // Вспомогательные методы конвертации
    private ContractSimple convertToContractSimple(Contract contract) {
        ContractSimple dto = new ContractSimple();
        dto.setId(contract.getId());
        dto.setNumber(contract.getNumber());
        dto.setDate(contract.getDate());
        dto.setPaymentStatus(contract.getPaymentStatus());
        dto.setApplicantName(contract.getApplicant() != null ?
                contract.getApplicant().getName() : null);
        return dto;
    }

    private ContractResponse convertToContractResponse(Contract contract) {
        ContractResponse dto = new ContractResponse();
        dto.setId(contract.getId());
        dto.setNumber(contract.getNumber());
        dto.setDate(contract.getDate());
        dto.setApplicantName(contract.getApplicant() != null ?
                contract.getApplicant().getName() : null);
        dto.setPaymentStatus(contract.getPaymentStatus());
        dto.setComments(contract.getComments());
        dto.setCreatedBy(contract.getCreatedBy());
        if (contract.getCreatedBy() != null) {
            Optional<User> createdBy = userService.getUserById(contract.getCreatedBy());
            if (createdBy.isPresent()) {
                dto.setCreatedByName(buildShortName(createdBy.get()));
            }
        }
        dto.setCreatedAt(contract.getCreatedAt());
        return dto;
    }

    private TaskSimple convertToTaskSimple(Task task) {
        TaskSimple dto = new TaskSimple();
        dto.setId(task.getId());
        dto.setNumber(task.getNumber());
        dto.setApplicationDate(task.getApplicationDate());
        dto.setDocType(task.getDocType());
        dto.setApplicantName(task.getApplicant() != null ? task.getApplicant().getName() : null);
        dto.setTypeName(task.getTypeName());
        dto.setProcessType(task.getProcessType());
        dto.setPreviousProcessType(task.getPreviousProcessType());
        if (task.getAssignedUserId() != null) {
            userService.getUserById(task.getAssignedUserId())
                    .ifPresent(user -> dto.setAssignedUserName(buildShortName(user)));
        }
        dto.setStatus(task.getStatus() != null ? task.getStatus().name() : null);
        dto.setCreatedAt(task.getCreatedAt());
        return dto;
    }

    private String buildShortName(User user) {
        StringBuilder shortName = new StringBuilder();
        if (user.getSecondName() != null && !user.getSecondName().isBlank()) {
            shortName.append(user.getSecondName());
        }
        if (user.getFirstName() != null && !user.getFirstName().isBlank()) {
            if (shortName.length() > 0) {
                shortName.append(" ");
            }
            shortName.append(user.getFirstName().charAt(0)).append(".");
        }
        if (user.getPatronymic() != null && !user.getPatronymic().isBlank()) {
            if (shortName.length() > 0) {
                shortName.append(" ");
            }
            shortName.append(user.getPatronymic().charAt(0)).append(".");
        }
        return shortName.toString();
    }

    private Applicant getOrCreateApplicant(String name) {
        return applicantRepository.findByName(name)
                .orElseGet(() -> applicantRepository.save(new Applicant(name)));
    }
}