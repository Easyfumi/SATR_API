package backend_monolithic.controller;

import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.PaymentStatus;
import backend_monolithic.model.dto.ContractResponse;
import backend_monolithic.model.dto.ContractSimple;
import backend_monolithic.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
// @RequestMapping("/api/contracts")
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {
    private final ContractService contractService;

    @GetMapping
    public ResponseEntity<List<ContractSimple>> getAllContracts() {
        return ResponseEntity.ok(contractService.findAllSimple());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getContractById(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.findById(id));
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<TaskSimple>> getContractTasks(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.findContractTasks(id));
    }

    @PostMapping
    public ResponseEntity<?> createContract(
            @Valid @RequestBody ContractRequest request,
            @RequestHeader("Authorization") String jwt) {
        try {
            ContractResponse contract = contractService.save(request, jwt);
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
            ContractResponse contract = contractService.update(id, request);
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
            ContractResponse contract = contractService.updateComments(id, comments);
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
            ContractResponse contract = contractService.updatePaymentStatus(id, paymentStatus);
            return ResponseEntity.ok(contract);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Некорректный статус оплаты"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
