package backend_monolithic.service;

import backend_monolithic.config.TaskSpecifications;
import backend_monolithic.error.BusinessException;
import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.error.TaskNotFoundException;
import backend_monolithic.model.*;
import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.TaskStatus;
import backend_monolithic.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskServiceImplementation implements TaskService {

    private final TaskRepository taskRepository;
    private final ApplicantRepository applicantRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final RepresentativeRepository representativeRepository;
    private final ContractRepository contractRepository;
    private final UserService userService;

    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request, String jwt) {
        User user = userService.getUserProfile(jwt);
        Task task = mapRequestToEntity(request);

        // Устанавливаем договор (One-to-Many)
        if (request.getContractId() != null) {
            Contract contract = contractRepository.findById(request.getContractId())
                    .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));
            task.setContract(contract);
        }

        task.setCreatedBy(user.getId());
        task.setCreatedAt(LocalDateTime.now());
        task.setStatus(TaskStatus.RECEIVED);

        Task savedTask = taskRepository.save(task);
        return mapEntityToResponse(savedTask);
    }

    @Override
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Задача не найдена"));
        return mapEntityToResponse(task);
    }

    @Override
    public List<TaskResponse> getAllTasks(String jwt) {
        return taskRepository.findAll().stream()
                .sorted(Comparator.comparing(Task::getCreatedAt).reversed())
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<TaskResponse> getFilteredTasks(TaskFilter filter, String jwt, int page, int size) {
        Specification<Task> spec = TaskSpecifications.buildSpecification(filter);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Task> taskPage = taskRepository.findAll(spec, pageable);

        List<TaskResponse> taskResponses = taskPage.getContent().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());

        PageResponse<TaskResponse> pageResponse = new PageResponse<>();
        pageResponse.setContent(taskResponses);
        pageResponse.setCurrentPage(taskPage.getNumber());
        pageResponse.setTotalPages(taskPage.getTotalPages());
        pageResponse.setTotalElements(taskPage.getTotalElements());
        pageResponse.setPageSize(taskPage.getSize());

        return pageResponse;
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Задача не найдена"));

        // Обновляем поля задачи
        task.setDocType(request.getDocType());
        task.setApplicant(getOrCreateApplicant(request.getApplicantName()));
        task.setManufacturer(getOrCreateManufacturer(request.getManufacturerName()));
        task.setCategories(request.getCategories());
        task.setMark(request.getMark());
        task.setTypeName(request.getTypeName());
        task.setPreviousProcessType(request.getPreviousProcessType());
        task.setPreviousNumber(request.getPreviousNumber());
        task.setProcessType(request.getProcessType());
        task.setRepresentative(getOrCreateRepresentative(request.getRepresentativeName()));
        task.setAssignedUserId(request.getAssignedUserId());

        // Обновляем договор (One-to-Many)
        if (request.getContractId() != null) {
            Contract contract = contractRepository.findById(request.getContractId())
                    .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));
            task.setContract(contract);
        } else {
            task.setContract(null);
        }

        Task updatedTask = taskRepository.save(task);
        return mapEntityToResponse(updatedTask);
    }

    @Override
    @Transactional
    public TaskResponse updateStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Задача не найдена"));

        validateStatusTransition(task.getStatus(), newStatus);

        task.setStatus(newStatus);

        if (newStatus == TaskStatus.COMPLETED) {
            task.setDecisionAt(LocalDate.now());
        }

        Task updatedTask = taskRepository.save(task);
        return mapEntityToResponse(updatedTask);
    }

    @Override
    @Transactional
    public TaskResponse setTaskNumber(Long taskId, String number) {
        if (taskRepository.existsByNumber(number)) {
            throw new DuplicateNumberException("Номер " + number + " уже существует");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Задача не найдена"));

        if (task.getNumber() != null) {
            throw new BusinessException("Номер уже назначен");
        }

        task.setNumber(number);
        task = taskRepository.save(task);
        return mapEntityToResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse setDecisionDate(Long taskId, LocalDate decisionDate) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Задача не найдена"));

        if (task.getDecisionAt() != null) {
            throw new BusinessException("Дата решения уже назначена");
        }

        if (decisionDate.isAfter(LocalDate.now())) {
            throw new BusinessException("Дата решения не может быть в будущем");
        }

        task.setDecisionAt(decisionDate);
        task = taskRepository.save(task);
        return mapEntityToResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse updateTaskContract(Long taskId, Long contractId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Задача не найдена"));

        Contract contract = null;
        if (contractId != null) {
            contract = contractRepository.findById(contractId)
                    .orElseThrow(() -> new EntityNotFoundException("Договор не найден"));
        }

        task.setContract(contract);
        Task updatedTask = taskRepository.save(task);
        return mapEntityToResponse(updatedTask);
    }

    @Override
    public List<TaskDuplicateInfo> checkDuplicates(TaskRequest request) {
        List<Task> existingTasks = taskRepository.findByStatusNot(TaskStatus.COMPLETED);
        Task newTask = mapRequestToEntity(request);

        return existingTasks.stream()
                .filter(existingTask -> areTasksDuplicates(existingTask, newTask))
                .map(existingTask -> new TaskDuplicateInfo(
                        existingTask.getId(),
                        getTaskDisplayIdentifier(existingTask),
                        existingTask.getStatus(),
                        existingTask.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    // Вспомогательные методы

    private Task mapRequestToEntity(TaskRequest request) {
        Task task = new Task();
        task.setDocType(request.getDocType());
        task.setApplicant(getOrCreateApplicant(request.getApplicantName()));
        task.setManufacturer(getOrCreateManufacturer(request.getManufacturerName()));
        task.setCategories(request.getCategories());
        task.setMark(request.getMark());
        task.setTypeName(request.getTypeName());
        task.setPreviousProcessType(request.getPreviousProcessType());
        task.setPreviousNumber(request.getPreviousNumber());
        task.setProcessType(request.getProcessType());
        task.setRepresentative(getOrCreateRepresentative(request.getRepresentativeName()));
        task.setAssignedUserId(request.getAssignedUserId());
        return task;
    }

    private TaskResponse mapEntityToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setNumber(task.getNumber());
        response.setDocType(task.getDocType());
        response.setApplicant(task.getApplicant().getName());
        response.setManufacturer(task.getManufacturer().getName());
        response.setCategories(task.getCategories());
        response.setMark(task.getMark());
        response.setTypeName(task.getTypeName());
        response.setProcessType(task.getProcessType());
        response.setPreviousProcessType(task.getPreviousProcessType());
        response.setPreviousNumber(task.getPreviousNumber());
        response.setRepresentative(task.getRepresentative().getName());
        response.setDecisionAt(task.getDecisionAt());
        response.setCreatedAt(task.getCreatedAt());
        response.setStatus(task.getStatus().name());

        // Обработка createdBy
        Optional<User> createdBy = userService.getUserById(task.getCreatedBy());
        if (createdBy.isPresent()) {
            User user = createdBy.get();
            response.setCreatedBy(user.getFirstName() + " " +
                    user.getSecondName().charAt(0) + "." +
                    user.getPatronymic().charAt(0) + ".");
        }

        // Обработка assignedUser
        if (task.getAssignedUserId() != null) {
            userService.getUserById(task.getAssignedUserId())
                    .ifPresent(user -> response.setAssignedUser(new UserInfo(user)));
        }

        // Обработка договора (One-to-Many)
        if (task.getContract() != null) {
            ContractSimple contractDTO = new ContractSimple();
            contractDTO.setId(task.getContract().getId());
            contractDTO.setNumber(task.getContract().getNumber());
            contractDTO.setDate(task.getContract().getDate());
            contractDTO.setPaymentStatus(task.getContract().getPaymentStatus());
            if (task.getContract().getApplicant() != null) {
                contractDTO.setApplicantName(task.getContract().getApplicant().getName());
            }
            response.setContract(contractDTO);
        }

        return response;
    }

    private boolean areTasksDuplicates(Task task1, Task task2) {
        return Objects.equals(task1.getDocType(), task2.getDocType())
                && Objects.equals(task1.getApplicant(), task2.getApplicant())
                && Objects.equals(task1.getManufacturer(), task2.getManufacturer())
                && Objects.equals(task1.getCategories(), task2.getCategories())
                && Objects.equals(task1.getMark(), task2.getMark())
                && Objects.equals(task1.getTypeName(), task2.getTypeName())
                && Objects.equals(task1.getProcessType(), task2.getProcessType())
                && Objects.equals(task1.getPreviousNumber(), task2.getPreviousNumber())
                && Objects.equals(task1.getPreviousProcessType(), task2.getPreviousProcessType())
                && Objects.equals(task1.getRepresentative(), task2.getRepresentative());
    }

    private String getTaskDisplayIdentifier(Task task) {
        if (task.getNumber() != null && !task.getNumber().trim().isEmpty()) {
            return task.getNumber();
        } else {
            return String.format("ID: %d (%s)",
                    task.getId(),
                    task.getCreatedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
        }
    }

    private void validateStatusTransition(TaskStatus currentStatus, TaskStatus newStatus) {
        if (currentStatus == TaskStatus.COMPLETED) {
            throw new BusinessException("Нельзя изменить статус завершенной задачи");
        }
    }

    private Applicant getOrCreateApplicant(String name) {
        return applicantRepository.findByName(name)
                .orElseGet(() -> applicantRepository.save(new Applicant(name)));
    }

    private Manufacturer getOrCreateManufacturer(String name) {
        return manufacturerRepository.findByName(name)
                .orElseGet(() -> manufacturerRepository.save(new Manufacturer(name)));
    }

    private Representative getOrCreateRepresentative(String name) {
        return representativeRepository.findByName(name)
                .orElseGet(() -> representativeRepository.save(new Representative(name)));
    }
}

