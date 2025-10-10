package backend_monolithic.controller;

import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.TaskStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.error.TaskNotFoundException;
import backend_monolithic.service.TaskService;
import backend_monolithic.service.UserService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;
    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createTask(
            @RequestBody TaskRequest request,
            @RequestHeader("Authorization") String jwt) {

        // Проверяем дубликаты
        List<TaskDuplicateInfo> duplicates = taskService.checkDuplicates(request);

        if (!duplicates.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("hasDuplicates", true);
            response.put("duplicates", duplicates);
            response.put("taskRequest", request);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        TaskResponse response = taskService.createTask(request, jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/create/force")
    public ResponseEntity<TaskResponse> createTaskForce(
            @RequestBody TaskRequest request,
            @RequestHeader("Authorization") String jwt) {
        TaskResponse response = taskService.createTask(request, jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            @RequestHeader("Authorization") String jwt) {
        return ResponseEntity.ok(taskService.getAllTasks(jwt));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PutMapping("/{id}/number")
    public ResponseEntity<?> setTaskNumber(
            @PathVariable Long id,
            @Valid @RequestBody TaskNumberRequest request) {
        try {
            TaskResponse response = taskService.setTaskNumber(id, request.getNumber());
            return ResponseEntity.ok(response);
        } catch (DuplicateNumberException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (TaskNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/decision-date")
    public ResponseEntity<?> setDecisionDate(
            @PathVariable Long id,
            @Valid @RequestBody TaskDecisionDateRequest request) {
        try {
            TaskResponse response = taskService.setDecisionDate(id, request.getDecisionDate());
            return ResponseEntity.ok(response);
        } catch (TaskNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusRequest request) {
        try {
            TaskResponse response = taskService.updateStatus(id, request.getStatus());
            return ResponseEntity.ok(response);
        } catch (TaskNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<TaskResponse>> searchTasks(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) String quickSearch,
            @RequestParam(required = false) String number,
            @RequestParam(required = false) String applicant,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) String mark,
            @RequestParam(required = false) String typeName,
            @RequestParam(required = false) String representative,
            @RequestParam(required = false) String assignedUser,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Boolean paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAtFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAtTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        TaskFilter filter = new TaskFilter();
        filter.setQuickSearch(quickSearch);
        filter.setNumber(number);
        filter.setApplicant(applicant);
        filter.setManufacturer(manufacturer);
        filter.setMark(mark);
        filter.setTypeName(typeName);
        filter.setRepresentative(representative);
        filter.setAssignedUser(assignedUser);
        filter.setStatus(status);
        filter.setPaymentStatus(paymentStatus);
        filter.setCreatedAtFrom(createdAtFrom);
        filter.setCreatedAtTo(createdAtTo);

        PageResponse<TaskResponse> response = taskService.getFilteredTasks(filter, jwt, page, size);
        return ResponseEntity.ok(response);
    }

    // POST метод также нужно обновить, если он используется
    @PostMapping("/search")
    public ResponseEntity<PageResponse<TaskResponse>> searchTasksPost(
            @RequestHeader("Authorization") String jwt,
            @RequestBody TaskFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponse<TaskResponse> response = taskService.getFilteredTasks(filter, jwt, page, size);
        return ResponseEntity.ok(response);
    }
}





