package backend_monolithic.controller;

import backend_monolithic.model.dto.TaskContractDTO;
import backend_monolithic.model.dto.TaskWithContractDTO;
import backend_monolithic.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskContractController {

    private final TaskService taskService;

    @PutMapping("/{taskId}/contract")
    public ResponseEntity<TaskWithContractDTO> assignContractToTask(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskContractDTO taskContractDTO) {

        TaskWithContractDTO result = taskService.assignContractToTask(taskId, taskContractDTO.getContractId());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{taskId}/contract")
    public ResponseEntity<TaskWithContractDTO> removeContractFromTask(@PathVariable Long taskId) {
        TaskWithContractDTO result = taskService.removeContractFromTask(taskId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{taskId}/contract")
    public ResponseEntity<TaskWithContractDTO> getTaskWithContract(@PathVariable Long taskId) {
        TaskWithContractDTO result = taskService.getTaskWithContractInfo(taskId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/by-contract/{contractId}")
    public ResponseEntity<List<TaskWithContractDTO>> getTasksByContract(@PathVariable Long contractId) {
        List<TaskWithContractDTO> tasks = taskService.getTasksByContract(contractId);
        return ResponseEntity.ok(tasks);
    }
}