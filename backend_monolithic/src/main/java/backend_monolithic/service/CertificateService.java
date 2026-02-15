package backend_monolithic.service;

import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.CertificateStatus;

import java.time.LocalDate;
import java.util.List;

public interface CertificateService {
    CertificateResponse createCertificate(CertificateRequest request, String jwt);
    CertificateResponse getCertificateById(Long id);
    List<CertificateResponse> getAllCertificates();
    List<CertificateResponse> getMyCertificates(String jwt);
    CertificateResponse updateCertificate(Long certificateId, CertificateRequest request);
    void deleteCertificate(Long certificateId);
    CertificateResponse setCertificateNumber(Long certificateId, String number, LocalDate applicationDate);
    CertificateResponse updateStatus(Long certificateId, CertificateStatus status, String certificateNumber);
    CertificateResponse updateCertificateExpert(Long certificateId, Long assignedUserId);
    List<CertificateDuplicateInfo> checkDuplicates(CertificateRequest request);
}

