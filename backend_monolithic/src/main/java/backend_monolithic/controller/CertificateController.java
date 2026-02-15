package backend_monolithic.controller;

import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.model.dto.*;
import backend_monolithic.service.CertificateService;
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
@RequestMapping("/certificates")
@RequiredArgsConstructor
public class CertificateController {
    private final CertificateService certificateService;

    @PostMapping
    public ResponseEntity<?> createCertificate(
            @Valid @RequestBody CertificateRequest request,
            @RequestHeader("Authorization") String jwt) {
        List<CertificateDuplicateInfo> duplicates = certificateService.checkDuplicates(request);
        if (!duplicates.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("hasDuplicates", true);
            response.put("duplicates", duplicates);
            response.put("certificateRequest", request);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(certificateService.createCertificate(request, jwt));
    }

    @PostMapping("/create")
    public ResponseEntity<CertificateResponse> createCertificateForce(
            @Valid @RequestBody CertificateRequest request,
            @RequestHeader("Authorization") String jwt) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(certificateService.createCertificate(request, jwt));
    }

    @GetMapping
    public ResponseEntity<List<CertificateResponse>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }

    @GetMapping("/my")
    public ResponseEntity<List<CertificateResponse>> getMyCertificates(
            @RequestHeader("Authorization") String jwt) {
        return ResponseEntity.ok(certificateService.getMyCertificates(jwt));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCertificateById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(certificateService.getCertificateById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCertificate(
            @PathVariable Long id,
            @Valid @RequestBody CertificateRequest request) {
        try {
            return ResponseEntity.ok(certificateService.updateCertificate(id, request));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCertificate(@PathVariable Long id) {
        try {
            certificateService.deleteCertificate(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/number")
    public ResponseEntity<?> setCertificateNumber(
            @PathVariable Long id,
            @Valid @RequestBody CertificateNumberRequest request) {
        try {
            CertificateResponse response = certificateService.setCertificateNumber(
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
            @Valid @RequestBody CertificateStatusUpdateRequest request) {
        try {
            CertificateResponse response = certificateService.updateStatus(
                    id,
                    request.getStatus(),
                    request.getCertificateNumber()
            );
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/expert")
    public ResponseEntity<?> updateCertificateExpert(
            @PathVariable Long id,
            @RequestBody CertificateExpertUpdateRequest request) {
        try {
            return ResponseEntity.ok(certificateService.updateCertificateExpert(id, request.getAssignedUserId()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/check-duplicates")
    public ResponseEntity<List<CertificateDuplicateInfo>> checkDuplicates(
            @Valid @RequestBody CertificateRequest request) {
        return ResponseEntity.ok(certificateService.checkDuplicates(request));
    }
}

