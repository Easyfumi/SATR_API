package backend_monolithic.service;

import backend_monolithic.config.TaskSpecifications;
import backend_monolithic.error.BusinessException;
import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.error.TaskNotFoundException;
import backend_monolithic.model.*;
import backend_monolithic.model.dto.*;
import backend_monolithic.model.dto.TaskAssignmentNotification;
import backend_monolithic.model.dto.TaskDecisionNotification;
import backend_monolithic.model.enums.TaskStatus;
import backend_monolithic.model.enums.Role;
import backend_monolithic.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final NotificationProducerService notificationProducerService;
    private final TaskDecisionFileService taskDecisionFileService;

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
        Task task = taskRepository.findByIdWithContract(id)
                .orElseThrow(() -> new EntityNotFoundException("Задача не найдена"));
        return mapEntityToResponse(task);
    }

    @Override
    public List<TaskResponse> getAllTasks(String jwt) {
        return taskRepository.findAll().stream()
                .sorted(Comparator
                        .comparingInt((Task task) -> TaskStatus.listSortIndex(task.getStatus()))
                        .thenComparing(Task::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<TaskResponse> getFilteredTasks(TaskFilter filter, String jwt, int page, int size) {
        Specification<Task> spec = TaskSpecifications.buildSpecification(filter)
                .and(TaskSpecifications.orderedByDefaultStatusPriority());
        Pageable pageable = PageRequest.of(page, size);

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
    public PageResponse<TaskResponse> getMyTasks(TaskFilter filter, String jwt, int page, int size) {
        User user = userService.getUserProfile(jwt);
        TaskFilter effectiveFilter = filter != null ? filter : new TaskFilter();

        Specification<Task> spec = TaskSpecifications.withAssignedUserId(user.getId())
                .and(TaskSpecifications.buildSpecification(effectiveFilter))
                .and(TaskSpecifications.orderedByDefaultStatusPriority());
        Pageable pageable = PageRequest.of(page, size);

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
        task.setProcessExpiryDate(request.getProcessExpiryDate());
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
    public TaskResponse updateStatus(Long taskId, TaskStatus newStatus, String documentNumber) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Задача не найдена"));

        assignDocumentNumberIfProvided(task, taskId, documentNumber);

        if (newStatus == TaskStatus.PROJECT) {
            requireDocumentNumber(task, "статуса 'Проект'");
        }

        task.setStatus(newStatus);

        if (newStatus == TaskStatus.COMPLETED) {
            requireDocumentNumber(task, "завершения заявки");
            task.setCompletedAt(LocalDate.now());
        } else {
            task.setCompletedAt(null);
        }

        Task updatedTask = taskRepository.save(task);
        return mapEntityToResponse(updatedTask);
    }

    @Override
    @Transactional
    public TaskResponse setTaskNumber(Long taskId, String number, LocalDate applicationDate) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Задача не найдена"));

        if (task.getNumber() != null) {
            throw new BusinessException("Номер уже назначен");
        }

        String suffix = switch (task.getDocType()) {
            case "ОТТС" -> "Е";
            case "ОТШ" -> "К";
            default -> throw new BusinessException("Неизвестный тип одобрения");
        };
        String applicationNumber = number + suffix;
        LocalDate yearStart = applicationDate.withDayOfYear(1);
        LocalDate nextYearStart = yearStart.plusYears(1);

        if (taskRepository.existsByNumberAndApplicationDateGreaterThanEqualAndApplicationDateLessThan(
                applicationNumber, yearStart, nextYearStart)) {
            throw new DuplicateNumberException(
                    "Номер " + applicationNumber + " уже существует в " + applicationDate.getYear() + " году");
        }

        task.setNumber(applicationNumber);
        task.setApplicationDate(applicationDate);
        task.setStatus(TaskStatus.REGISTERED);
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
        task.setStatus(TaskStatus.DECISION_DONE);
        task = taskRepository.save(task);
        
        // Отправка уведомлений всем пользователям с ролью "Бухгалтерия"
        List<User> accountants = userService.getUsersByRole(Role.ACCOUNTANT);
        for (User accountant : accountants) {
            TaskDecisionNotification notification = new TaskDecisionNotification();
            notification.setRecipientEmail(accountant.getEmail());
            notification.setRecipientName(buildShortName(accountant));
            notification.setTaskId(task.getId());
            notification.setTaskNumber(task.getNumber() != null ? task.getNumber() : "ID: " + task.getId());
            notification.setApplicationDate(task.getApplicationDate());
            notification.setApplicantName(task.getApplicant() != null ? task.getApplicant().getName() : "Не указан");
            
            notificationProducerService.sendTaskDecisionNotification(notification);
        }
        
        return mapEntityToResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse setDocumentNumber(Long taskId, String documentNumber) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Задача не найдена"));

        if (task.getDecisionAt() == null) {
            throw new BusinessException("Номер документа можно указать только после установки даты решения");
        }

        if (task.getDocumentNumber() != null && !task.getDocumentNumber().isBlank()) {
            throw new BusinessException("Номер документа уже назначен");
        }

        assignDocumentNumberIfProvided(task, taskId, documentNumber);
        requireDocumentNumber(task, "сохранения номера документа");

        Task updatedTask = taskRepository.save(task);
        sendTaskDocumentNumberAssignedNotifications(updatedTask);
        return mapEntityToResponse(updatedTask);
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
    @Transactional
    public TaskResponse updateTaskExpert(Long taskId, Long assignedUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Задача не найдена"));

        if (assignedUserId == null) {
            task.setAssignedUserId(null);
        } else {
            User user = userService.getUserById(assignedUserId)
                    .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));
            if (user.getRoles() == null || !user.getRoles().contains(Role.EXPERT)) {
                throw new BusinessException("Пользователь не является экспертом");
            }
            task.setAssignedUserId(assignedUserId);
            
            // Отправка уведомления о назначении исполнителя
            TaskAssignmentNotification notification = new TaskAssignmentNotification();
            notification.setRecipientEmail(user.getEmail());
            notification.setRecipientName(buildShortName(user));
            notification.setTaskId(task.getId());
            notification.setTaskNumber(task.getNumber() != null ? task.getNumber() : "ID: " + task.getId());
            notification.setMessage("Новая заявка в работу");
            
            notificationProducerService.sendTaskAssignmentNotification(notification);
        }

        Task updatedTask = taskRepository.save(task);
        return mapEntityToResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Задача не найдена"));

        // Explicitly detach from contract to keep the bidirectional relation consistent.
        taskDecisionFileService.deleteTaskDirectory(task);
        task.setContract(null);
        taskRepository.delete(task);
    }

    @Override
    public List<TaskDuplicateInfo> checkDuplicates(TaskRequest request) {
        List<Task> existingTasks = taskRepository.findByStatusNot(TaskStatus.COMPLETED);
        Task newTask = mapRequestToEntityForComparison(request);

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
        task.setProcessExpiryDate(request.getProcessExpiryDate());
        task.setRepresentative(getOrCreateRepresentative(request.getRepresentativeName()));
        task.setAssignedUserId(request.getAssignedUserId());
        return task;
    }

    // Метод для создания Task из request без сохранения связанных сущностей (для проверки дубликатов)
    private Task mapRequestToEntityForComparison(TaskRequest request) {
        Task task = new Task();
        task.setDocType(request.getDocType());
        // Создаем временные объекты только с именами для сравнения (без сохранения в БД)
        if (request.getApplicantName() != null && !request.getApplicantName().trim().isEmpty()) {
            task.setApplicant(new Applicant(request.getApplicantName()));
        }
        if (request.getManufacturerName() != null && !request.getManufacturerName().trim().isEmpty()) {
            task.setManufacturer(new Manufacturer(request.getManufacturerName()));
        }
        task.setCategories(request.getCategories());
        task.setMark(request.getMark());
        task.setTypeName(request.getTypeName());
        task.setPreviousProcessType(request.getPreviousProcessType());
        task.setPreviousNumber(request.getPreviousNumber());
        task.setProcessType(request.getProcessType());
        task.setProcessExpiryDate(request.getProcessExpiryDate());
        if (request.getRepresentativeName() != null && !request.getRepresentativeName().trim().isEmpty()) {
            task.setRepresentative(new Representative(request.getRepresentativeName()));
        }
        task.setAssignedUserId(request.getAssignedUserId());
        return task;
    }

    private TaskResponse mapEntityToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setNumber(task.getNumber());
        response.setDocumentNumber(task.getDocumentNumber());
        response.setDocType(task.getDocType());
        response.setApplicant(task.getApplicant() != null ? task.getApplicant().getName() : null);
        response.setManufacturer(task.getManufacturer() != null ? task.getManufacturer().getName() : null);
        response.setCategories(task.getCategories());
        response.setMark(task.getMark());
        response.setTypeName(task.getTypeName());
        response.setProcessType(task.getProcessType());
        response.setProcessExpiryDate(task.getProcessExpiryDate());
        response.setPreviousProcessType(task.getPreviousProcessType());
        response.setPreviousNumber(task.getPreviousNumber());
        response.setRepresentative(task.getRepresentative() != null ? task.getRepresentative().getName() : null);
        response.setApplicationDate(task.getApplicationDate());
        response.setDecisionAt(task.getDecisionAt());
        response.setCompletedAt(task.getCompletedAt());
        response.setCreatedAt(task.getCreatedAt());
        response.setStatus(task.getStatus() != null ? task.getStatus().name() : null);
        response.setAssignedUserId(task.getAssignedUserId());
        if (task.getDecisionFileStoredName() != null) {
            response.setDecisionFile(new DecisionFileInfo(
                    task.getDecisionFileOriginalName(),
                    task.getDecisionFileContentType(),
                    task.getDecisionFileSize(),
                    task.getDecisionFileUploadedAt(),
                    "application/pdf".equals(task.getDecisionFileContentType())
            ));
        }

        // Обработка createdBy
        if (task.getCreatedBy() != null) {
            Optional<User> createdBy = userService.getUserById(task.getCreatedBy());
            if (createdBy.isPresent()) {
                User user = createdBy.get();
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
                response.setCreatedBy(shortName.toString());
            }
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
        // Сравниваем основные поля
        if (!Objects.equals(task1.getDocType(), task2.getDocType())) return false;
        if (!Objects.equals(task1.getMark(), task2.getMark())) return false;
        if (!Objects.equals(task1.getTypeName(), task2.getTypeName())) return false;
        if (!Objects.equals(task1.getProcessType(), task2.getProcessType())) return false;

        // Сравниваем имена заявителей
        String applicant1 = task1.getApplicant() != null ? task1.getApplicant().getName() : null;
        String applicant2 = task2.getApplicant() != null ? task2.getApplicant().getName() : null;
        if (!Objects.equals(applicant1, applicant2)) return false;

        // Сравниваем имена производителей
        String manufacturer1 = task1.getManufacturer() != null ? task1.getManufacturer().getName() : null;
        String manufacturer2 = task2.getManufacturer() != null ? task2.getManufacturer().getName() : null;
        if (!Objects.equals(manufacturer1, manufacturer2)) return false;

        // Сравниваем категории (учитывая null)
        if (task1.getCategories() == null && task2.getCategories() != null) return false;
        if (task1.getCategories() != null && task2.getCategories() == null) return false;
        if (task1.getCategories() != null && task2.getCategories() != null) {
            if (!new HashSet<>(task1.getCategories()).equals(new HashSet<>(task2.getCategories()))) {
                return false;
            }
        }

        // Сравниваем представителей (null и пустая строка считаются равными)
        String rep1 = task1.getRepresentative() != null ? task1.getRepresentative().getName() : null;
        String rep2 = task2.getRepresentative() != null ? task2.getRepresentative().getName() : null;
        if (rep1 == null) rep1 = "";
        if (rep2 == null) rep2 = "";
        if (!Objects.equals(rep1, rep2)) return false;

        // Сравниваем предыдущие данные
        if (!Objects.equals(task1.getPreviousNumber(), task2.getPreviousNumber())) return false;
        if (!Objects.equals(task1.getPreviousProcessType(), task2.getPreviousProcessType())) return false;

        return true;
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

    private void assignDocumentNumberIfProvided(Task task, Long taskId, String documentNumber) {
        if (documentNumber == null || documentNumber.isBlank()) {
            return;
        }

        String normalizedDocumentNumber = documentNumber.trim();
        if (taskRepository.existsByDocumentNumberAndIdNot(normalizedDocumentNumber, taskId)) {
            throw new DuplicateNumberException("Номер документа " + normalizedDocumentNumber + " уже существует");
        }

        task.setDocumentNumber(normalizedDocumentNumber);
    }

    private void requireDocumentNumber(Task task, String actionDescription) {
        if (task.getDocumentNumber() == null || task.getDocumentNumber().isBlank()) {
            throw new BusinessException("Номер документа обязателен для " + actionDescription);
        }
    }

    private Applicant getOrCreateApplicant(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new BusinessException("Имя заявителя обязательно");
        }
        return applicantRepository.findByName(name)
                .orElseGet(() -> applicantRepository.save(new Applicant(name)));
    }

    private Manufacturer getOrCreateManufacturer(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new BusinessException("Имя производителя обязательно");
        }
        return manufacturerRepository.findByName(name)
                .orElseGet(() -> manufacturerRepository.save(new Manufacturer(name)));
    }

    private Representative getOrCreateRepresentative(String name) {
        // Если имя пустое или null, возвращаем null (представитель отсутствует)
        if (name == null || name.trim().isEmpty()) {
            return null;
        }

        // Для пустого имени создаем специального представителя "отсутствует"
        // Это позволит ссылаться на одну и ту же запись для всех задач без представителя
        if (name.trim().isEmpty()) {
            return representativeRepository.findByName("отсутствует")
                    .orElseGet(() -> representativeRepository.save(new Representative("отсутствует")));
        }

        return representativeRepository.findByName(name)
                .orElseGet(() -> representativeRepository.save(new Representative(name)));
    }

    private void sendTaskDocumentNumberAssignedNotifications(Task task) {
        String applicationNumber = task.getNumber() != null && !task.getNumber().isBlank()
                ? task.getNumber()
                : "ID: " + task.getId();
        String executorName = "Не назначен";
        if (task.getAssignedUserId() != null) {
            executorName = userService.getUserById(task.getAssignedUserId())
                    .map(this::buildShortName)
                    .orElse("Не назначен");
        }

        List<User> accountants = userService.getUsersByRole(Role.ACCOUNTANT);
        for (User accountant : accountants) {
            TaskDocumentNumberAssignedNotification notification =
                    new TaskDocumentNumberAssignedNotification();
            notification.setRecipientEmail(accountant.getEmail());
            notification.setRecipientName(buildShortName(accountant));
            notification.setTaskId(task.getId());
            notification.setApplicationNumber(applicationNumber);
            notification.setDocumentNumber(task.getDocumentNumber());
            notification.setDocType(task.getDocType());
            notification.setExecutorName(executorName);
            notificationProducerService.sendTaskDocumentNumberAssignedNotification(notification);
        }
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
}