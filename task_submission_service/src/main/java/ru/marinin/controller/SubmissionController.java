package ru.marinin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.marinin.model.Submission;
import ru.marinin.model.UserDto;
import ru.marinin.service.SubmissionService;
import ru.marinin.service.TaskService;
import ru.marinin.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;
    @Autowired
    private UserService userService;
    @Autowired
    private TaskService taskService;

    @PostMapping()
    public ResponseEntity<Submission> submitTask(
            @RequestParam Long taskId,
            @RequestParam String comment,
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto userDto = userService.getUserProfile(jwt);
        Submission submission = submissionService.submitTask(taskId, comment, userDto.getId(), jwt);
        return new ResponseEntity<>(submission, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto userDto = userService.getUserProfile(jwt);
        Submission submission = submissionService.getTaskSubmissionsById(id);
        return new ResponseEntity<>(submission, HttpStatus.CREATED);
    }

    @GetMapping()
    public ResponseEntity<List<Submission>> getAllSubmissions(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto userDto = userService.getUserProfile(jwt);
        List<Submission> submissions = submissionService.getAllTasksSubmissions();
        return new ResponseEntity<>(submissions, HttpStatus.CREATED);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Submission>> getAllTaskSubmissions(
            @PathVariable Long taskId,
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto userDto = userService.getUserProfile(jwt);
        List<Submission> submissions = submissionService.getTaskSubmissionByTaskId(taskId);
        return new ResponseEntity<>(submissions, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Submission> acceptDeclineSubmission(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto userDto = userService.getUserProfile(jwt);
        Submission submission = submissionService.acceptDeclineSubmission(id, status);
        return new ResponseEntity<>(submission, HttpStatus.CREATED);
    }
}
