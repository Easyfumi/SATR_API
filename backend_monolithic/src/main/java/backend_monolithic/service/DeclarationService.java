package backend_monolithic.service;

import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.DeclarationStatus;

import java.time.LocalDate;
import java.util.List;

public interface DeclarationService {
    DeclarationResponse createDeclaration(DeclarationRequest request, String jwt);
    DeclarationResponse getDeclarationById(Long id);
    List<DeclarationResponse> getAllDeclarations();
    List<DeclarationResponse> getMyDeclarations(String jwt);
    DeclarationResponse updateDeclaration(Long declarationId, DeclarationRequest request);
    void deleteDeclaration(Long declarationId);
    DeclarationResponse setDeclarationNumber(Long declarationId, String number, LocalDate applicationDate);
    DeclarationResponse updateStatus(Long declarationId, DeclarationStatus status, String declarationNumber);
    DeclarationResponse updateDeclarationExpert(Long declarationId, Long assignedUserId);
    List<DeclarationDuplicateInfo> checkDuplicates(DeclarationRequest request);
}
