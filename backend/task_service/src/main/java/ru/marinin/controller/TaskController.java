package ru.marinin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.marinin.model.Task;
import ru.marinin.model.TaskStatus;
import ru.marinin.model.UserDto;
import ru.marinin.service.TaskService;
import ru.marinin.service.TaskServiceImplementation;
import ru.marinin.service.UserService;

import java.util.List;


@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Task> createTask(
            @RequestBody Task task,
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto userDto = userService.getUserProfile(jwt);

        Task createdTask = taskService.createTask(task);

        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) throws Exception {

        Task task = taskService.getTaskById(id);

        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @GetMapping("/user")
    public ResponseEntity<List<Task>> getAssignedUserTasks(
            @RequestParam(required = false) TaskStatus taskStatus,
            @RequestHeader("Authorization") String jwt) throws Exception {

        UserDto userDto = userService.getUserProfile(jwt);

        List<Task> tasks = taskService.assignedUsersTask(userDto.getId(), taskStatus);

        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    @GetMapping()
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) TaskStatus taskStatus,
            @RequestHeader("Authorization") String jwt) throws Exception {

        UserDto userDto = userService.getUserProfile(jwt);

        List<Task> tasks = taskService.getAllTask(taskStatus);

        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    @PutMapping("/{id}/user/{userid}/assigned")
    public ResponseEntity<Task> assignedTaskToUser(
            @PathVariable Long id,
            @PathVariable Long userid,
            @RequestHeader("Authorization") String jwt) throws Exception {

        UserDto userDto = userService.getUserProfile(jwt);

        Task task = taskService.assignedToUser(userid, id);

        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @RequestBody Task req,
            @RequestHeader("Authorization") String jwt) throws Exception {

        UserDto userDto = userService.getUserProfile(jwt);

        Task task = taskService.updateTask(id,  req, userDto.getId());

        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Task> completeTask(
            @PathVariable Long id) throws Exception {

        Task task = taskService.completeTask(id);

        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id) throws Exception {

        taskService.deleteTask(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }




}
