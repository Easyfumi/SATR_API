package backend_monolithic.service;


import backend_monolithic.config.TaskSpecifications;
import backend_monolithic.error.BusinessException;
import backend_monolithic.model.*;
import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.PaymentStatus;
import backend_monolithic.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.error.TaskNotFoundException;
import backend_monolithic.model.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;


@Service
@RequiredArgsConstructor
public class TaskServiceImplementation implements TaskService {

    private final TaskRepository taskRepository;
    private final ApplicantRepository applicantRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final RepresentativeRepository representativeRepository;
    private final UserService userService;
    private final ContractRepository contractRepository;

    public TaskResponse createTask(TaskRequest request, String jwt) {
        User user = userService.getUserProfile(jwt);
        UserInfo userInfo = new UserInfo(user);
        Task task = mapRequestToEntity(request);

        task.setCreatedBy(userInfo.getId());
        task.setCreatedAt(LocalDateTime.now());
        task.setStatus(TaskStatus.RECEIVED);    // Default status
        Task savedTask = taskRepository.save(task);
        return mapEntityToResponse(savedTask);
    }

    public List<TaskDuplicateInfo> checkDuplicates(TaskRequest request) {
        // Получаем все заявки кроме завершенных
        List<Task> existingTasks = taskRepository.findByStatusNot(TaskStatus.COMPLETED);

        // Маппим request в Task для сравнения
        Task newTask = mapRequestToEntity(request);

        // Ищем дубликаты путем прямого сравнения полей
        return existingTasks.stream()
                .filter(existingTask -> areTasksDuplicates(existingTask, newTask))
                .map(existingTask -> new TaskDuplicateInfo(
                        existingTask.getId(),
                        getTaskDisplayIdentifier(existingTask), // Используем идентификатор для отображения
                        existingTask.getStatus(),
                        existingTask.getCreatedAt() // Добавим дату создания для информации
                ))
                .collect(Collectors.toList());
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
        // Если есть номер - используем его, иначе используем ID и дату создания
        if (task.getNumber() != null && !task.getNumber().trim().isEmpty()) {
            return task.getNumber();
        } else {
            return String.format("ID: %d (%s)",
                    task.getId(),
                    task.getCreatedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
        }
    }

    public List<TaskResponse> getAllTasks(String jwt) {
        // TODO добавить проверку токена
        return taskRepository.findAll().stream()
                .sorted(Comparator.comparing(Task::getCreatedAt).reversed())
                .map(task -> {
                    TaskResponse taskResponse = mapEntityToResponse(task);
                    if (task.getAssignedUserId() != null) {
                        userService.getUserById(task.getAssignedUserId())
                                .ifPresent(user -> taskResponse.setAssignedUser(new UserInfo(user)));
                    }
                    return taskResponse;
                })
                .collect(Collectors.toList());
    }

    // Новый метод для фильтрации задач
    public PageResponse<TaskResponse> getFilteredTasks(TaskFilter filter, String jwt, int page, int size) {
        // TODO добавить проверку токена

        Specification<Task> spec = TaskSpecifications.buildSpecification(filter);

        // Создаем Pageable для пагинации
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Получаем страницу задач
        Page<Task> taskPage = taskRepository.findAll(spec, pageable);

        // Преобразуем задачи в TaskResponse
        List<TaskResponse> taskResponses = taskPage.getContent().stream()
                .map(task -> {
                    TaskResponse taskResponse = mapEntityToResponse(task);
                    if (task.getAssignedUserId() != null) {
                        userService.getUserById(task.getAssignedUserId())
                                .ifPresent(user -> taskResponse.setAssignedUser(new UserInfo(user)));
                    }
                    return taskResponse;
                })
                .collect(Collectors.toList());

        // Создаем и возвращаем PageResponse
        PageResponse<TaskResponse> pageResponse = new PageResponse<>();
        pageResponse.setContent(taskResponses);
        pageResponse.setCurrentPage(taskPage.getNumber());
        pageResponse.setTotalPages(taskPage.getTotalPages());
        pageResponse.setTotalElements(taskPage.getTotalElements());
        pageResponse.setPageSize(taskPage.getSize());

        return pageResponse;
    }




    public TaskResponse updateStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Заявка не найдена"));

        // Дополнительные проверки при необходимости
        validateStatusTransition(task.getStatus(), newStatus);

        task.setStatus(newStatus);

        // Если статус COMPLETED, можно установить дату завершения
        if (newStatus == TaskStatus.COMPLETED) {
            task.setDecisionAt(LocalDate.now());
        }

        Task updatedTask = taskRepository.save(task);
        return mapEntityToResponse(updatedTask);
    }

    private void validateStatusTransition(TaskStatus currentStatus, TaskStatus newStatus) {
        // Здесь можно добавить бизнес-логику валидации переходов статусов
        // Например, запретить переход из COMPLETED в другие статусы
        if (currentStatus == TaskStatus.COMPLETED) {
            throw new IllegalStateException("Нельзя изменить статус завершенной заявки");
        }

        // Добавьте другие проверки согласно бизнес-правилам
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        return mapEntityToResponse(task);
    }

    public TaskResponse setTaskNumber(Long taskId, String number) {
        // Проверка существования номера
        if (taskRepository.existsByNumber(number)) {
            throw new DuplicateNumberException("Номер " + number + " уже существует");
        }
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Заявка не найдена"));
        // Проверка что номер еще не установлен
        if (task.getNumber() != null) {
            throw new IllegalStateException("Номер уже назначен");
        }
        task.setNumber(number);
        task = taskRepository.save(task);
        return mapEntityToResponse(task);
    }

    public TaskResponse setDecisionDate(Long taskId, LocalDate decisionDate) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Заявка не найдена"));

        // Проверка что дата решения еще не установлена (опционально)
        if (task.getDecisionAt() != null) {
            throw new IllegalStateException("Дата решения уже назначена");
        }

        // Дополнительные проверки даты (например, что дата не в будущем)
        if (decisionDate.isAfter(LocalDate.now())) {
            throw new IllegalStateException("Дата решения не может быть в будущем");
        }

        task.setDecisionAt(decisionDate);
        task = taskRepository.save(task);
        return mapEntityToResponse(task);
    }

    private Task mapRequestToEntity(TaskRequest request) {
        Task task = new Task();
        task.setDocType(request.getDocType());

        // Обработка Applicant: найти или создать
        task.setApplicant(getOrCreateApplicant(request.getApplicantName()));

        // Обработка Manufacturer: найти или создать
        task.setManufacturer(getOrCreateManufacturer(request.getManufacturerName()));

        task.setCategories(request.getCategories());
        task.setMark(request.getMark());
        task.setTypeName(request.getTypeName());
        task.setPreviousProcessType(request.getPreviousProcessType());

        if (request.getPreviousNumber() != null) {
            task.setPreviousNumber(request.getPreviousNumber());
        }

        task.setProcessType(request.getProcessType());

        // Обработка Representative: найти или создать
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
            response.setCreatedBy(createdBy.get().getFirstName() + " "
                    + createdBy.get().getSecondName().charAt(0) + "."
                    + createdBy.get().getPatronymic().charAt(0) + ".");
        }

        // Обновленный маппинг договора с новыми полями
        if (task.getContract() != null) {
            ContractInfo contractInfo = new ContractInfo();
            contractInfo.setId(task.getContract().getId());
            contractInfo.setNumber(task.getContract().getNumber());
            contractInfo.setDate(task.getContract().getDate());
            contractInfo.setPaymentStatus(task.getContract().getPaymentStatus());
            contractInfo.setApplicant(task.getContract().getApplicant());

            response.setContract(contractInfo);
        }

        return response;
    }


    // Для Applicant
    private Applicant getOrCreateApplicant(String name) {
        return applicantRepository.findByName(name)
                .orElseGet(() -> applicantRepository.save(new Applicant(name)));
    }

    // Для Manufacturer (аналогично)
    private Manufacturer getOrCreateManufacturer(String name) {
        return manufacturerRepository.findByName(name)
                .orElseGet(() -> manufacturerRepository.save(new Manufacturer(name)));
    }

    // Для Representative (аналогично)
    private Representative getOrCreateRepresentative(String name) {
        return representativeRepository.findByName(name)
                .orElseGet(() -> representativeRepository.save(new Representative(name)));
    }


    public TaskWithContractDTO assignContractToTask(Long taskId, Long contractId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new EntityNotFoundException("Contract not found with id: " + contractId));

        // Проверяем, что договор и задача принадлежат одному заявителю (опционально)
        if (!task.getApplicant().getId().equals(contract.getApplicant().getId())) {
            throw new BusinessException("Task and contract must belong to the same applicant");
        }

        task.setContract(contract);
        Task savedTask = taskRepository.save(task);

        return convertToTaskWithContractDTO(savedTask);
    }

    public TaskWithContractDTO removeContractFromTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        task.setContract(null);
        Task savedTask = taskRepository.save(task);

        return convertToTaskWithContractDTO(savedTask);
    }

    public TaskWithContractDTO getTaskWithContractInfo(Long taskId) {
        Task task = taskRepository.findByIdWithContract(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        return convertToTaskWithContractDTO(task);
    }

    public List<TaskWithContractDTO> getTasksByContract(Long contractId) {
        List<Task> tasks = taskRepository.findByContractId(contractId);
        return tasks.stream()
                .map(this::convertToTaskWithContractDTO)
                .collect(Collectors.toList());
    }

    private TaskWithContractDTO convertToTaskWithContractDTO(Task task) {
        TaskWithContractDTO dto = new TaskWithContractDTO();
        dto.setId(task.getId());
        dto.setNumber(task.getNumber());
        dto.setDocType(task.getDocType());
        dto.setMark(task.getMark());
        dto.setTypeName(task.getTypeName());
        dto.setStatus(task.getStatus());
        dto.setCreatedAt(task.getCreatedAt());

        if (task.getContract() != null) {
            Contract contract = task.getContract();
            TaskWithContractDTO.ContractInfoDTO contractInfo = new TaskWithContractDTO.ContractInfoDTO();
            contractInfo.setId(contract.getId());
            contractInfo.setNumber(contract.getNumber());
            contractInfo.setDate(contract.getDate());
            contractInfo.setPaymentStatus(contract.getPaymentStatus());
            contractInfo.setApplicantName(contract.getApplicant() != null ? contract.getApplicant().getName() : null);

            dto.setContract(contractInfo);
        }

        return dto;
    }


    public TaskResponse updateTask(Long taskId, TaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        // Обновляем только разрешенные поля
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

        Task updatedTask = taskRepository.save(task);
        return mapEntityToResponse(updatedTask);
    }
}

