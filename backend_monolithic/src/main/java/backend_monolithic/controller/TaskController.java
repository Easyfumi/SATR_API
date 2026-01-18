package backend_monolithic.controller;

import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.error.TaskNotFoundException;
import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.TaskStatus;
import backend_monolithic.service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(
            @Valid @RequestBody TaskRequest request,
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

    @PostMapping("/create")
    public ResponseEntity<TaskResponse> createTaskForce(
            @Valid @RequestBody TaskRequest request,
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

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        try {
            TaskResponse response = taskService.updateTask(id, request);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/number")  // Changed from PATCH to PUT
    public ResponseEntity<?> setTaskNumber(
            @PathVariable Long id,
            @Valid @RequestBody TaskNumberRequest request) {
        try {
            TaskResponse response = taskService.setTaskNumber(id, request.getNumber(), request.getApplicationDate());
            return ResponseEntity.ok(response);
        } catch (DuplicateNumberException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (TaskNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/decision-date")  // Changed from PATCH to PUT
    public ResponseEntity<?> setDecisionDate(
            @PathVariable Long id,
            @Valid @RequestBody TaskDecisionDateRequest request) {
        try {
            TaskResponse response = taskService.setDecisionDate(id, request.getDecisionDate());
            return ResponseEntity.ok(response);
        } catch (TaskNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")  // Changed from PATCH to PUT
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusUpdateRequest request) {
        try {
            TaskResponse response = taskService.updateStatus(id, request.getStatus());
            return ResponseEntity.ok(response);
        } catch (TaskNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/contract")
    public ResponseEntity<?> updateTaskContract(
            @PathVariable Long id,
            @RequestBody TaskContractUpdateRequest request) {
        try {
            TaskResponse response = taskService.updateTaskContract(id, request.getContractId());
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/contract")
    public ResponseEntity<?> deleteTaskContract(@PathVariable Long id) {
        try {
            TaskResponse response = taskService.updateTaskContract(id, null);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/expert")
    public ResponseEntity<?> updateTaskExpert(
            @PathVariable Long id,
            @RequestBody TaskExpertUpdateRequest request) {
        try {
            TaskResponse response = taskService.updateTaskExpert(id, request.getAssignedUserId());
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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
            @RequestParam(required = false) Boolean hasContract,
            @RequestParam(required = false) String contractNumber,
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
        filter.setHasContract(hasContract);
        filter.setContractNumber(contractNumber);
        filter.setCreatedAtFrom(createdAtFrom);
        filter.setCreatedAtTo(createdAtTo);

        PageResponse<TaskResponse> response = taskService.getFilteredTasks(filter, jwt, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/search")
    public ResponseEntity<PageResponse<TaskResponse>> searchTasksPost(
            @RequestHeader("Authorization") String jwt,
            @RequestBody TaskFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponse<TaskResponse> response = taskService.getFilteredTasks(filter, jwt, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check-duplicates")
    public ResponseEntity<List<TaskDuplicateInfo>> checkDuplicates(
            @Valid @RequestBody TaskRequest request) {
        List<TaskDuplicateInfo> duplicates = taskService.checkDuplicates(request);
        return ResponseEntity.ok(duplicates);
    }

    @GetMapping("/my")
    public ResponseEntity<PageResponse<TaskResponse>> getMyTasks(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<TaskResponse> response = taskService.getMyTasks(jwt, page, size);
        return ResponseEntity.ok(response);
    }
}