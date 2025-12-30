package backend_monolithic.controller;

import backend_monolithic.model.Contract;
import backend_monolithic.model.Task;
import backend_monolithic.model.dto.ContractRequest;
import backend_monolithic.model.enums.PaymentStatus;
import backend_monolithic.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {
    private final ContractService contractService;

    @GetMapping
    public ResponseEntity<List<Contract>> getAllContracts() {
        return ResponseEntity.ok(contractService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contract> getContractById(@PathVariable Long id) {
        return contractService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createContract(
            @Valid @RequestBody ContractRequest request,
            @RequestHeader("Authorization") String jwt) {
        try {
            Contract contract = contractService.save(request, jwt);
            return ResponseEntity.status(HttpStatus.CREATED).body(contract);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateContract(
            @PathVariable Long id,
            @Valid @RequestBody ContractRequest request) {
        try {
            Contract contract = contractService.update(id, request);
            return ResponseEntity.ok(contract);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContract(@PathVariable Long id) {
        try {
            contractService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/comments")
    public ResponseEntity<?> updateComments(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String comments = request.get("comments");
            Contract contract = contractService.updateComments(id, comments);
            return ResponseEntity.ok(contract);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            PaymentStatus paymentStatus = PaymentStatus.valueOf(request.get("paymentStatus"));
            Contract contract = contractService.updatePaymentStatus(id, paymentStatus);
            return ResponseEntity.ok(contract);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/available-tasks")
    public ResponseEntity<List<Task>> getAvailableTasks() {
        List<Task> tasks = contractService.findTasksWithoutContract();
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/{id}/tasks")
    public ResponseEntity<?> addTasksToContract(
            @PathVariable Long id,
            @RequestBody List<Long> taskIds) {
        try {
            contractService.addTasksToContract(id, taskIds);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/tasks")
    public ResponseEntity<?> removeTasksFromContract(
            @PathVariable Long id,
            @RequestBody List<Long> taskIds) {
        try {
            contractService.removeTasksFromContract(id, taskIds);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
