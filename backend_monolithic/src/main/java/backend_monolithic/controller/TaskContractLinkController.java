package backend_monolithic.controller;

import backend_monolithic.model.dto.LinkRequest;
import backend_monolithic.model.dto.LinkResponse;
import backend_monolithic.service.TaskContractLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/task-contract-links")
@RequiredArgsConstructor
@Validated
public class TaskContractLinkController {

    private final TaskContractLinkService linkService;

    @PostMapping("/link")
    public ResponseEntity<LinkResponse> linkTaskToContract(
            @Valid @RequestBody LinkRequest request,
            @RequestHeader("Authorization") String jwt) {

        LinkResponse response = linkService.linkTaskToContract(request, jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/unlink/task/{taskId}/contract/{contractId}")
    public ResponseEntity<Void> unlinkTaskFromContract(
            @PathVariable Long taskId,
            @PathVariable Long contractId) {

        linkService.unlinkTaskFromContract(taskId, contractId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/task/{taskId}/contracts")
    public ResponseEntity<List<LinkResponse>> getTaskContracts(@PathVariable Long taskId) {
        List<LinkResponse> responses = linkService.getTaskContracts(taskId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/contract/{contractId}/tasks")
    public ResponseEntity<List<LinkResponse>> getContractTasks(@PathVariable Long contractId) {
        List<LinkResponse> responses = linkService.getContractTasks(contractId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/check/task/{taskId}/contract/{contractId}")
    public ResponseEntity<Map<String, Boolean>> checkLink(
            @PathVariable Long taskId,
            @PathVariable Long contractId) {

        boolean isLinked = linkService.isTaskLinkedToContract(taskId, contractId);
        return ResponseEntity.ok(Collections.singletonMap("isLinked", isLinked));
    }
}
