package backend_monolithic.service;


import backend_monolithic.model.*;
import backend_monolithic.model.dto.UserInfo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.error.TaskNotFoundException;
import backend_monolithic.model.dto.TaskRequest;
import backend_monolithic.model.dto.TaskResponse;
import backend_monolithic.model.enums.TaskStatus;
import backend_monolithic.repository.ApplicantRepository;
import backend_monolithic.repository.ManufacturerRepository;
import backend_monolithic.repository.RepresentativeRepository;
import backend_monolithic.repository.TaskRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class TaskServiceImplementation implements TaskService {

    private final TaskRepository taskRepository;
    private final ApplicantRepository applicantRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final RepresentativeRepository representativeRepository;
    private final UserService userService;

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

    public List<TaskResponse> getAllTasks(String jwt) {
        // TODO добавить проверку токена

        List<TaskResponse> result = new ArrayList<>();

        for (Task task : taskRepository.findAll()) {
            TaskResponse taskResponse = mapEntityToResponse(task);
            if (task.getAssignedUserId() != null) {
                Optional<User> assignedUser = userService.getUserById(task.getAssignedUserId());
                taskResponse.setAssignedUser(new UserInfo(assignedUser.get()));
            }
            result.add(taskResponse);
        }

        return result;
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
        response.setRepresentative(task.getRepresentative().getName());
        response.setCreatedAt(task.getCreatedAt());
        response.setStatus(task.getStatus().name());
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

}


//         Long id; +
//         String number; +
//         String docType; +
//         String applicant; +
//         String manufacturer; +
//         List<String> categories; +
//         String mark; +
//         String typeName; +
//         String processType;
//         String representative; +
//         Long createdBy;
//         Long assignedUserId;
//         String status; +
//         LocalDateTime createdAt; +
//         LocalDate decisionAt;
//         Boolean paymentStatus;


//    @Override
//    public TaskResponse updateTask(Long id, TaskRequest request) {
//        return null;
//    }
//
//    public TaskResponse updateTask(Long id, TaskRequest request) {
//        Task task = taskRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
//
//        mapRequestToEntity(request, task);
//        Task updatedTask = taskRepository.save(task);
//        return mapEntityToResponse(updatedTask);
//    }
//
//    public void deleteTask(Long id) {
//        taskRepository.deleteById(id);
//    }

//    public TaskResponse changeStatus(Long id, String status) {
//        Task task = taskRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
//
//        task.setStatus(TaskStatus.valueOf(status.toUpperCase()));
//
//
//
//        return mapEntityToResponse(taskRepository.save(task));
//    }

//    public TaskResponse assignUser(Long id, Long userId) {
//        Task task = taskRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
//
//        task.setAssignedUserId(userId);
//        return mapEntityToResponse(taskRepository.save(task));
//    }

//    @Override
//    public List<TaskResponse> filterTasks(String status, List<String> categories) {
//        return List.of();
//    }
//
//    public List<TaskResponse> filterTasks(String status, List<String> categories) {
//        List<Task> tasks = taskRepository.findByFilters(
//                status != null ? TaskStatus.valueOf(status.toUpperCase()) : null,
//                categories != null ? categories.stream()
//                        .map(String::toUpperCase)
//                        .map(VehicleCategories::valueOf)
//                        .toList() : null
//        );
//        return tasks.stream()
//                .map(this::mapEntityToResponse)
//                .toList();
//    }