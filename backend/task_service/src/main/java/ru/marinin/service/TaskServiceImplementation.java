package ru.marinin.service;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class TaskServiceImplementation implements TaskService {

    private final TaskRepository taskRepository;
    private final ApplicantRepository applicantRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final RepresentativeRepository representativeRepository;
    private final ModelMapper modelMapper;
    private final UserService userService;

    public TaskResponse createTask(TaskRequest request, String jwt) {
        UserInfo userInfo = userService.getUserProfile(jwt);
        Task task = new Task();
        mapRequestToEntity(request, task);
        task.setCreatedAt(LocalDateTime.now());
        task.setStatus(TaskStatus.RECEIVED); // Default status

//        // Автоматическая генерация номера при регистрации
//        if (task.getStatus() == TaskStatus.REGISTERED) {
//            task.setNumber(generateTaskNumber());
//        }
        task.setCreatedBy(userInfo.getId());
        Task savedTask = taskRepository.save(task);
        return mapEntityToResponse(savedTask);
    }

    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapEntityToResponse)
                .toList();
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        return mapEntityToResponse(task);
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        mapRequestToEntity(request, task);
        Task updatedTask = taskRepository.save(task);
        return mapEntityToResponse(updatedTask);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public TaskResponse changeStatus(Long id, String status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        task.setStatus(TaskStatus.valueOf(status.toUpperCase()));

        // Генерация номера при переходе в статус REGISTERED
        if (task.getStatus() == TaskStatus.REGISTERED && task.getNumber() == null) {
            task.setNumber(generateTaskNumber());
        }

        return mapEntityToResponse(taskRepository.save(task));
    }

    public TaskResponse assignUser(Long id, Long userId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        task.setAssignedUserId(userId);
        return mapEntityToResponse(taskRepository.save(task));
    }

    public List<TaskResponse> filterTasks(String status, List<String> categories) {
        List<Task> tasks = taskRepository.findByFilters(
                status != null ? TaskStatus.valueOf(status.toUpperCase()) : null,
                categories != null ? categories.stream()
                        .map(String::toUpperCase)
                        .map(VehicleCategories::valueOf)
                        .toList() : null
        );
        return tasks.stream()
                .map(this::mapEntityToResponse)
                .toList();
    }

    private void mapRequestToEntity(TaskRequest request, Task task) {
        modelMapper.map(request, task);

        task.setApplicant(applicantRepository.findById(request.getApplicantId()).orElse(null));
        task.setManufacturer(manufacturerRepository.findById(request.getManufacturerId()).orElse(null));
        task.setManufacturersRepresentative(
                representativeRepository.findById(request.getRepresentativeId()).orElse(null));

        if (request.getCategories() != null) {
            task.setCategories(request.getCategories().stream()
                    .map(String::toUpperCase)
                    .map(VehicleCategories::valueOf)
                    .toList());
        }

        if (request.getStatus() != null) {
            task.setStatus(TaskStatus.valueOf(request.getStatus().toUpperCase()));
        }
    }

    private TaskResponse mapEntityToResponse(Task task) {
        TaskResponse response = modelMapper.map(task, TaskResponse.class);
        response.setApplicant(task.getApplicant().getName());
        response.setManufacturer(task.getManufacturer().getName());
        if (task.getManufacturersRepresentative() != null) {
            response.setRepresentative(task.getManufacturersRepresentative().getName());
        }
        response.setCategories(task.getCategories().stream()
                .map(Enum::name)
                .toList());
        response.setStatus(task.getStatus().name());
        return response;
    }

    private String generateTaskNumber() {
        // Логика генерации уникального номера заявки
        return "TASK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
