package backend_monolithic.controller;

import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.model.dto.*;
import backend_monolithic.service.DeclarationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/declarations")
@RequiredArgsConstructor
public class DeclarationController {
    private final DeclarationService declarationService;

    @PostMapping
    public ResponseEntity<?> createDeclaration(
            @Valid @RequestBody DeclarationRequest request,
            @RequestHeader("Authorization") String jwt) {
        List<DeclarationDuplicateInfo> duplicates = declarationService.checkDuplicates(request);
        if (!duplicates.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("hasDuplicates", true);
            response.put("duplicates", duplicates);
            response.put("declarationRequest", request);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(declarationService.createDeclaration(request, jwt));
    }

    @PostMapping("/create")
    public ResponseEntity<DeclarationResponse> createDeclarationForce(
            @Valid @RequestBody DeclarationRequest request,
            @RequestHeader("Authorization") String jwt) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(declarationService.createDeclaration(request, jwt));
    }

    @GetMapping
    public ResponseEntity<List<DeclarationResponse>> getAllDeclarations() {
        return ResponseEntity.ok(declarationService.getAllDeclarations());
    }

    @GetMapping("/my")
    public ResponseEntity<List<DeclarationResponse>> getMyDeclarations(
            @RequestHeader("Authorization") String jwt) {
        return ResponseEntity.ok(declarationService.getMyDeclarations(jwt));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDeclarationById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(declarationService.getDeclarationById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDeclaration(
            @PathVariable Long id,
            @Valid @RequestBody DeclarationRequest request) {
        try {
            return ResponseEntity.ok(declarationService.updateDeclaration(id, request));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDeclaration(@PathVariable Long id) {
        try {
            declarationService.deleteDeclaration(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/number")
    public ResponseEntity<?> setDeclarationNumber(
            @PathVariable Long id,
            @Valid @RequestBody DeclarationNumberRequest request) {
        try {
            DeclarationResponse response = declarationService.setDeclarationNumber(
                    id,
                    request.getNumber(),
                    request.getApplicationDate()
            );
            return ResponseEntity.ok(response);
        } catch (DuplicateNumberException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody DeclarationStatusUpdateRequest request) {
        try {
            DeclarationResponse response = declarationService.updateStatus(
                    id,
                    request.getStatus(),
                    request.getDeclarationNumber()
            );
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/expert")
    public ResponseEntity<?> updateDeclarationExpert(
            @PathVariable Long id,
            @RequestBody DeclarationExpertUpdateRequest request) {
        try {
            return ResponseEntity.ok(declarationService.updateDeclarationExpert(id, request.getAssignedUserId()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/check-duplicates")
    public ResponseEntity<List<DeclarationDuplicateInfo>> checkDuplicates(
            @Valid @RequestBody DeclarationRequest request) {
        return ResponseEntity.ok(declarationService.checkDuplicates(request));
    }
}
