package ru.marinin.service;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.marinin.exceptions.DuplicateNumberException;
import ru.marinin.exceptions.TaskNotFoundException;
import ru.marinin.model.Applicant;
import ru.marinin.model.Manufacturer;
import ru.marinin.model.Representative;
import ru.marinin.model.Task;
import ru.marinin.model.dto.TaskRequest;
import ru.marinin.model.dto.TaskResponse;
import ru.marinin.model.dto.UserInfo;
import ru.marinin.model.enums.TaskStatus;
import ru.marinin.model.enums.VehicleCategories;
import ru.marinin.repository.ApplicantRepository;
import ru.marinin.repository.ManufacturerRepository;
import ru.marinin.repository.RepresentativeRepository;
import ru.marinin.repository.TaskRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class TaskServiceImplementation implements TaskService {

    private final TaskRepository taskRepository;
    private final ApplicantRepository applicantRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final RepresentativeRepository representativeRepository;
    private final UserService userService;

    public TaskResponse createTask(TaskRequest request, String jwt) {
        UserInfo userInfo = userService.getUserProfile(jwt);
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
                UserInfo assignedUser = userService.getUserById(task.getAssignedUserId(), jwt);
                taskResponse.setAssignedUser(assignedUser);
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
        task.setApplicant(applicantRepository.save(
                new Applicant(
                        request.getApplicantName())));
        task.setManufacturer(manufacturerRepository.save(
                new Manufacturer(
                        request.getManufacturerName())));
        task.setCategories(request.getCategories());
        task.setMark(request.getMark());
        task.setTypeName(request.getTypeName());
        task.setPreviousNumber(request.getPreviousNumber());
        task.setProcessType(request.getProcessType());
        task.setRepresentative(representativeRepository.save(
                new Representative(
                        request.getRepresentativeName())));
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