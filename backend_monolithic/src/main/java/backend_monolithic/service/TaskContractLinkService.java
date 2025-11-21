package backend_monolithic.service;

import backend_monolithic.error.BusinessException;
import backend_monolithic.model.Contract;
import backend_monolithic.model.Task;
import backend_monolithic.model.TaskContract;
import backend_monolithic.model.User;
import backend_monolithic.model.dto.LinkRequest;
import backend_monolithic.model.dto.LinkResponse;
import backend_monolithic.repository.ContractRepository;
import backend_monolithic.repository.TaskContractRepository;
import backend_monolithic.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskContractLinkService {

    private final TaskContractRepository taskContractRepository;
    private final TaskRepository taskRepository;
    private final ContractRepository contractRepository;
    private final UserService userService;

    public LinkResponse linkTaskToContract(LinkRequest request, String jwt) {
        User user = userService.getUserProfile(jwt);

        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + request.getTaskId()));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new EntityNotFoundException("Contract not found with id: " + request.getContractId()));

        // Проверяем, не существует ли уже связь
        if (taskContractRepository.existsByTaskIdAndContractId(request.getTaskId(), request.getContractId())) {
            throw new BusinessException("Связь между заявкой и договором уже существует");
        }

        // Проверяем, что заявка и договор принадлежат одному заявителю
        if (!task.getApplicant().getId().equals(contract.getApplicant().getId())) {
            throw new BusinessException("Заявка и договор должны принадлежать одному заявителю");
        }

        // Создаем связь
        TaskContract taskContract = new TaskContract();
        taskContract.setTask(task);
        taskContract.setContract(contract);
        taskContract.setLinkedBy(user.getId());
        taskContract.setLinkComment(request.getComment());

        TaskContract savedLink = taskContractRepository.save(taskContract);

        return mapToLinkResponse(savedLink);
    }

    public void unlinkTaskFromContract(Long taskId, Long contractId) {
        if (!taskContractRepository.existsByTaskIdAndContractId(taskId, contractId)) {
            throw new EntityNotFoundException("Связь между заявкой и договором не найдена");
        }

        taskContractRepository.deleteByTaskIdAndContractId(taskId, contractId);
    }

    public List<LinkResponse> getTaskContracts(Long taskId) {
        List<TaskContract> taskContracts = taskContractRepository.findByTaskIdWithContract(taskId);
        return taskContracts.stream()
                .map(this::mapToLinkResponse)
                .collect(Collectors.toList());
    }

    public List<LinkResponse> getContractTasks(Long contractId) {
        List<TaskContract> contractTasks = taskContractRepository.findByContractIdWithTask(contractId);
        return contractTasks.stream()
                .map(this::mapToLinkResponse)
                .collect(Collectors.toList());
    }

    public boolean isTaskLinkedToContract(Long taskId, Long contractId) {
        return taskContractRepository.existsByTaskIdAndContractId(taskId, contractId);
    }

    private LinkResponse mapToLinkResponse(TaskContract taskContract) {
        LinkResponse response = new LinkResponse();
        response.setId(taskContract.getId());
        response.setTaskId(taskContract.getTask().getId());
        response.setContractId(taskContract.getContract().getId());
        response.setLinkedAt(taskContract.getLinkedAt());
        response.setLinkedBy(taskContract.getLinkedBy());
        response.setLinkComment(taskContract.getLinkComment());
        response.setActive(taskContract.getIsActive());

        // Информация о задаче
        Task task = taskContract.getTask();
        response.setTaskNumber(task.getNumber());
        response.setTaskStatus(task.getStatus());

        // Информация о договоре
        Contract contract = taskContract.getContract();
        response.setContractNumber(contract.getNumber());
        response.setContractDate(contract.getDate());
        response.setPaymentStatus(contract.getPaymentStatus());

        return response;
    }
}