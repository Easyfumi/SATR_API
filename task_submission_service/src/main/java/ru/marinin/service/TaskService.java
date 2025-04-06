package ru.marinin.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import ru.marinin.model.TaskDto;

@FeignClient(name = "SUBMISSION-SERVICE", url = "http://localhost:5003/")
public interface TaskService {

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(
            @PathVariable Long id) throws Exception;

}
