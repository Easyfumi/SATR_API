package backend_monolithic.controller;

import backend_monolithic.model.Contract;
import backend_monolithic.model.Task;
import backend_monolithic.model.dto.ContractRequest;
import backend_monolithic.model.enums.PaymentStatus;
import backend_monolithic.service.ContractService;
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
    public ResponseEntity<?> createContract(@RequestBody ContractRequest request,
                                            @RequestHeader("Authorization") String jwt) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(contractService.save(request, jwt));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateContract(@PathVariable Long id, @RequestBody ContractRequest request) {
        try {
            return ResponseEntity.ok(contractService.update(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
    public ResponseEntity<?> updateComments(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String comments = request.get("comments");
            return ResponseEntity.ok(contractService.updateComments(id, comments));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            PaymentStatus paymentStatus = PaymentStatus.valueOf(request.get("paymentStatus"));
            return ResponseEntity.ok(contractService.updatePaymentStatus(id, paymentStatus));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

//    // Новый endpoint для связывания существующей задачи с контрактом
//    @PostMapping("/{contractId}/tasks/{taskId}")
//    public ResponseEntity<?> linkTaskToContract(
//            @PathVariable Long contractId,
//            @PathVariable Long taskId) {
//        try {
//            Task task = contractService.linkTaskToContract(contractId, taskId);
//            return ResponseEntity.ok(task);
//        } catch (RuntimeException e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
//
//    // Новый endpoint для получения задач без контракта
//    @GetMapping("/available-tasks")
//    public ResponseEntity<List<Task>> getAvailableTasks() {
//        return ResponseEntity.ok(contractService.findTasksWithoutContract());
//    }
}
