package backend_monolithic.controller;

import backend_monolithic.model.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.error.TaskNotFoundException;
import backend_monolithic.service.TaskService;
import backend_monolithic.service.UserService;

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
            response.put("taskRequest", request); // Сохраняем request для повторной отправки
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        TaskResponse response = taskService.createTask(request, jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Новый endpoint для принудительного создания с игнорированием дубликатов
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

}




//    @PutMapping("/{id}")
//    public ResponseEntity<TaskResponse> updateTask(
//            @PathVariable Long id,
//            @RequestBody TaskRequest request) {
//        return ResponseEntity.ok(taskService.updateTask(id, request));
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
//        taskService.deleteTask(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    @PatchMapping("/{id}/status")
//    public ResponseEntity<TaskResponse> changeStatus(
//            @PathVariable Long id,
//            @RequestParam String status) {
//        return ResponseEntity.ok(taskService.changeStatus(id, status));
//    }
//
//    @PatchMapping("/{id}/assign")
//    public ResponseEntity<TaskResponse> assignUser(
//            @PathVariable Long id,
//            @RequestParam Long userId) {
//        return ResponseEntity.ok(taskService.assignUser(id, userId));
//    }
//
//    @GetMapping("/filter")
//    public ResponseEntity<List<TaskResponse>> filterTasks(
//            @RequestParam(required = false) String status,
//            @RequestParam(required = false) List<String> categories) {
//        return ResponseEntity.ok(taskService.filterTasks(status, categories));

//    @Autowired
//    private TaskService taskService;
//
//    @Autowired
//    private UserService userService;
//
//    @PostMapping
//    public ResponseEntity<Task> createTask(
//            @RequestBody Task task,
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        UserDto userDto = userService.getUserProfile(jwt);
//
//        Task createdTask = taskService.createTask(task);
//
//        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
//    }
//
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Task> getTaskById(
//            @PathVariable Long id,
//            @RequestHeader("Authorization") String jwt) throws Exception {
//
//        Task task = taskService.getTaskById(id);
//
//        return new ResponseEntity<>(task, HttpStatus.OK);
//    }
//
//    @GetMapping("/user")
//    public ResponseEntity<List<Task>> getAssignedUserTasks(
//            @RequestParam(required = false) TaskStatus taskStatus,
//            @RequestHeader("Authorization") String jwt) throws Exception {
//
//        UserDto userDto = userService.getUserProfile(jwt);
//
//        List<Task> tasks = taskService.assignedUsersTask(userDto.getId(), taskStatus);
//
//        return new ResponseEntity<>(tasks, HttpStatus.OK);
//    }
//
//    @GetMapping()
//    public ResponseEntity<List<Task>> getAllTasks(
//            @RequestParam(required = false) TaskStatus taskStatus,
//            @RequestHeader("Authorization") String jwt) throws Exception {
//
//        UserDto userDto = userService.getUserProfile(jwt);
//
//        List<Task> tasks = taskService.getAllTask(taskStatus);
//
//        return new ResponseEntity<>(tasks, HttpStatus.OK);
//    }
//
//    @PutMapping("/{id}/user/{userid}/assigned")
//    public ResponseEntity<Task> assignedTaskToUser(
//            @PathVariable Long id,
//            @PathVariable Long userid,
//            @RequestHeader("Authorization") String jwt) throws Exception {
//
//        UserDto userDto = userService.getUserProfile(jwt);
//
//        Task task = taskService.assignedToUser(userid, id);
//
//        return new ResponseEntity<>(task, HttpStatus.OK);
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<Task> updateTask(
//            @PathVariable Long id,
//            @RequestBody Task req,
//            @RequestHeader("Authorization") String jwt) throws Exception {
//
//        UserDto userDto = userService.getUserProfile(jwt);
//
//        Task task = taskService.updateTask(id,  req, userDto.getId());
//
//        return new ResponseEntity<>(task, HttpStatus.OK);
//    }
//
//    @PutMapping("/{id}/complete")
//    public ResponseEntity<Task> completeTask(
//            @PathVariable Long id) throws Exception {
//
//        Task task = taskService.completeTask(id);
//
//        return new ResponseEntity<>(task, HttpStatus.OK);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteTask(
//            @PathVariable Long id) throws Exception {
//
//        taskService.deleteTask(id);
//
//        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
//    }

