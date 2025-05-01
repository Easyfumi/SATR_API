package ru.marinin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/tasks")
    public ResponseEntity<String> getAssignedUserTasks(
           ) throws Exception {

        return new ResponseEntity<>("you are in task service", HttpStatus.OK);
    }

}
