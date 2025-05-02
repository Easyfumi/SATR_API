package ru.marinin.controller;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.marinin.model.dto.TaskRequest;
import ru.marinin.model.dto.TaskResponse;
import ru.marinin.service.TaskService;

import ru.marinin.service.UserService;

import java.util.List;


@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;
    private final ModelMapper modelMapper;
    private final UserService userService;


    @PostMapping("/create")
    public ResponseEntity<TaskResponse> createTask(
            @RequestBody TaskRequest request,
            @RequestHeader("Authorization") String jwt) {

        TaskResponse response = taskService.createTask(request, jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(taskService.changeStatus(id, status));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TaskResponse> assignUser(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(taskService.assignUser(id, userId));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<TaskResponse>> filterTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) List<String> categories) {
        return ResponseEntity.ok(taskService.filterTasks(status, categories));
    }

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







}
