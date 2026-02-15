package backend_monolithic.service;

import backend_monolithic.error.BusinessException;
import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.model.*;
import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.CertificateStatus;
import backend_monolithic.model.enums.Role;
import backend_monolithic.repository.ApplicantRepository;
import backend_monolithic.repository.CertificateRepository;
import backend_monolithic.repository.ManufacturerRepository;
import backend_monolithic.repository.RepresentativeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CertificateServiceImplementation implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final ApplicantRepository applicantRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final RepresentativeRepository representativeRepository;
    private final UserService userService;
    private final NotificationProducerService notificationProducerService;

    @Override
    @Transactional
    public CertificateResponse createCertificate(CertificateRequest request, String jwt) {
        User user = userService.getUserProfile(jwt);
        Certificate certificate = mapRequestToEntity(request);

        certificate.setCreatedBy(user.getId());
        certificate.setCreatedAt(LocalDateTime.now());
        certificate.setStatus(CertificateStatus.RECEIVED);

        return mapEntityToResponse(certificateRepository.save(certificate));
    }

    @Override
    public CertificateResponse getCertificateById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Сертификат не найден"));
        return mapEntityToResponse(certificate);
    }

    @Override
    public List<CertificateResponse> getAllCertificates() {
        return certificateRepository.findAll().stream()
                .sorted(Comparator.comparing(Certificate::getCreatedAt).reversed())
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CertificateResponse> getMyCertificates(String jwt) {
        User user = userService.getUserProfile(jwt);
        return certificateRepository.findByAssignedUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CertificateResponse updateCertificate(Long certificateId, CertificateRequest request) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new EntityNotFoundException("Сертификат не найден"));

        if (certificate.getStatus() == CertificateStatus.CERTIFICATE_REGISTERED) {
            throw new BusinessException("Нельзя редактировать зарегистрированный сертификат");
        }

        certificate.setApplicant(getOrCreateApplicant(request.getApplicantName()));
        certificate.setManufacturer(getOrCreateManufacturer(request.getManufacturerName()));
        certificate.setRepresentative(getOrCreateRepresentative(request.getRepresentativeName()));
        certificate.setCategories(request.getCategories());
        certificate.setMark(request.getMark());
        certificate.setTypeName(request.getTypeName());
        certificate.setModifications(request.getModifications());
        certificate.setCommercialNames(request.getCommercialNames());
        certificate.setStandardSection(requireStandardSection(request.getStandardSection()));
        certificate.setAssignedUserId(request.getAssignedUserId());

        return mapEntityToResponse(certificateRepository.save(certificate));
    }

    @Override
    @Transactional
    public void deleteCertificate(Long certificateId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new EntityNotFoundException("Сертификат не найден"));

        if (certificate.getStatus() == CertificateStatus.CERTIFICATE_REGISTERED) {
            throw new BusinessException("Нельзя удалить зарегистрированный сертификат");
        }

        certificateRepository.delete(certificate);
    }

    @Override
    @Transactional
    public CertificateResponse setCertificateNumber(Long certificateId, String number, LocalDate applicationDate) {
        if (certificateRepository.existsByNumber(number)) {
            throw new DuplicateNumberException("Номер " + number + " уже существует");
        }

        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new EntityNotFoundException("Сертификат не найден"));

        if (certificate.getNumber() != null) {
            throw new BusinessException("Номер уже назначен");
        }

        certificate.setNumber(number);
        certificate.setApplicationDate(applicationDate);
        certificate.setStatus(CertificateStatus.JOURNAL_REGISTERED);
        return mapEntityToResponse(certificateRepository.save(certificate));
    }

    @Override
    @Transactional
    public CertificateResponse updateStatus(Long certificateId, CertificateStatus status, String certificateNumber) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new EntityNotFoundException("Сертификат не найден"));

        if (certificate.getStatus() == CertificateStatus.CERTIFICATE_REGISTERED) {
            throw new BusinessException("Нельзя изменить статус зарегистрированного сертификата");
        }

        if (status == CertificateStatus.RECEIVED || status == CertificateStatus.JOURNAL_REGISTERED) {
            throw new BusinessException("Этот статус устанавливается автоматически");
        }

        if (status == CertificateStatus.CERTIFICATE_REGISTERED) {
            if (certificateNumber == null || certificateNumber.isBlank()) {
                throw new BusinessException("Номер зарегистрированного сертификата обязателен");
            }
            String normalizedCertificateNumber = certificateNumber.trim();
            if (certificateRepository.existsByCertificateNumberAndIdNot(normalizedCertificateNumber, certificateId)) {
                throw new DuplicateNumberException("Номер сертификата " + normalizedCertificateNumber + " уже существует");
            }
            certificate.setCertificateNumber(normalizedCertificateNumber);
            certificate.setCertificateRegisteredAt(LocalDate.now());
            certificate.setStatus(CertificateStatus.CERTIFICATE_REGISTERED);
            certificate = certificateRepository.save(certificate);
            sendCertificateRegisteredNotifications(certificate);
            return mapEntityToResponse(certificate);
        }

        certificate.setStatus(status);
        return mapEntityToResponse(certificateRepository.save(certificate));
    }

    @Override
    @Transactional
    public CertificateResponse updateCertificateExpert(Long certificateId, Long assignedUserId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new EntityNotFoundException("Сертификат не найден"));

        if (assignedUserId == null) {
            certificate.setAssignedUserId(null);
        } else {
            User user = userService.getUserById(assignedUserId)
                    .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));
            if (user.getRoles() == null || !user.getRoles().contains(Role.EXPERT)) {
                throw new BusinessException("Пользователь не является экспертом");
            }
            certificate.setAssignedUserId(assignedUserId);
        }

        return mapEntityToResponse(certificateRepository.save(certificate));
    }

    @Override
    public List<CertificateDuplicateInfo> checkDuplicates(CertificateRequest request) {
        List<Certificate> existing = certificateRepository.findByStatusNot(CertificateStatus.CERTIFICATE_REGISTERED);
        Certificate incoming = mapRequestToEntityForComparison(request);

        return existing.stream()
                .filter(certificate -> areCertificatesDuplicates(certificate, incoming))
                .map(certificate -> new CertificateDuplicateInfo(
                        certificate.getId(),
                        getDisplayIdentifier(certificate),
                        certificate.getStatus(),
                        certificate.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    private Certificate mapRequestToEntity(CertificateRequest request) {
        Certificate certificate = new Certificate();
        certificate.setApplicant(getOrCreateApplicant(request.getApplicantName()));
        certificate.setManufacturer(getOrCreateManufacturer(request.getManufacturerName()));
        certificate.setRepresentative(getOrCreateRepresentative(request.getRepresentativeName()));
        certificate.setCategories(request.getCategories());
        certificate.setMark(request.getMark());
        certificate.setTypeName(request.getTypeName());
        certificate.setModifications(request.getModifications());
        certificate.setCommercialNames(request.getCommercialNames());
        certificate.setStandardSection(requireStandardSection(request.getStandardSection()));
        certificate.setAssignedUserId(request.getAssignedUserId());
        return certificate;
    }

    private Certificate mapRequestToEntityForComparison(CertificateRequest request) {
        Certificate certificate = new Certificate();
        if (request.getApplicantName() != null && !request.getApplicantName().trim().isEmpty()) {
            certificate.setApplicant(new Applicant(request.getApplicantName().trim()));
        }
        if (request.getManufacturerName() != null && !request.getManufacturerName().trim().isEmpty()) {
            certificate.setManufacturer(new Manufacturer(request.getManufacturerName().trim()));
        }
        if (request.getRepresentativeName() != null && !request.getRepresentativeName().trim().isEmpty()) {
            certificate.setRepresentative(new Representative(request.getRepresentativeName().trim()));
        }
        certificate.setCategories(request.getCategories());
        certificate.setMark(request.getMark());
        certificate.setTypeName(request.getTypeName());
        certificate.setModifications(request.getModifications());
        certificate.setCommercialNames(request.getCommercialNames());
        certificate.setStandardSection(request.getStandardSection());
        return certificate;
    }

    private CertificateResponse mapEntityToResponse(Certificate certificate) {
        CertificateResponse response = new CertificateResponse();
        response.setId(certificate.getId());
        response.setNumber(certificate.getNumber());
        response.setApplicationDate(certificate.getApplicationDate());
        response.setApplicant(certificate.getApplicant() != null ? certificate.getApplicant().getName() : null);
        response.setManufacturer(certificate.getManufacturer() != null ? certificate.getManufacturer().getName() : null);
        response.setRepresentative(certificate.getRepresentative() != null ? certificate.getRepresentative().getName() : null);
        response.setCategories(certificate.getCategories());
        response.setMark(certificate.getMark());
        response.setTypeName(certificate.getTypeName());
        response.setModifications(certificate.getModifications());
        response.setCommercialNames(certificate.getCommercialNames());
        response.setStandardSection(certificate.getStandardSection());
        response.setStatus(certificate.getStatus() != null ? certificate.getStatus().name() : null);
        response.setAssignedUserId(certificate.getAssignedUserId());
        response.setCertificateNumber(certificate.getCertificateNumber());
        response.setCertificateRegisteredAt(certificate.getCertificateRegisteredAt());
        response.setCreatedAt(certificate.getCreatedAt());

        if (certificate.getCreatedBy() != null) {
            userService.getUserById(certificate.getCreatedBy())
                    .ifPresent(user -> response.setCreatedBy(buildShortName(user)));
        }

        if (certificate.getAssignedUserId() != null) {
            userService.getUserById(certificate.getAssignedUserId())
                    .ifPresent(user -> response.setAssignedUser(new UserInfo(user)));
        }

        return response;
    }

    private boolean areCertificatesDuplicates(Certificate left, Certificate right) {
        if (!Objects.equals(left.getMark(), right.getMark())) return false;
        if (!Objects.equals(left.getTypeName(), right.getTypeName())) return false;
        if (!Objects.equals(left.getModifications(), right.getModifications())) return false;
        if (!Objects.equals(left.getCommercialNames(), right.getCommercialNames())) return false;
        if (!Objects.equals(left.getStandardSection(), right.getStandardSection())) return false;

        String applicant1 = left.getApplicant() != null ? left.getApplicant().getName() : null;
        String applicant2 = right.getApplicant() != null ? right.getApplicant().getName() : null;
        if (!Objects.equals(applicant1, applicant2)) return false;

        String manufacturer1 = left.getManufacturer() != null ? left.getManufacturer().getName() : null;
        String manufacturer2 = right.getManufacturer() != null ? right.getManufacturer().getName() : null;
        if (!Objects.equals(manufacturer1, manufacturer2)) return false;

        String representative1 = left.getRepresentative() != null ? left.getRepresentative().getName() : "";
        String representative2 = right.getRepresentative() != null ? right.getRepresentative().getName() : "";
        if (!Objects.equals(representative1, representative2)) return false;

        if (left.getCategories() == null && right.getCategories() != null) return false;
        if (left.getCategories() != null && right.getCategories() == null) return false;
        if (left.getCategories() != null && right.getCategories() != null) {
            if (!new HashSet<>(left.getCategories()).equals(new HashSet<>(right.getCategories()))) {
                return false;
            }
        }

        return true;
    }

    private String getDisplayIdentifier(Certificate certificate) {
        if (certificate.getNumber() != null && !certificate.getNumber().trim().isEmpty()) {
            return certificate.getNumber();
        }
        return String.format("ID: %d (%s)",
                certificate.getId(),
                certificate.getCreatedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
    }

    private Applicant getOrCreateApplicant(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new BusinessException("Имя заявителя обязательно");
        }
        return applicantRepository.findByName(name.trim())
                .orElseGet(() -> applicantRepository.save(new Applicant(name.trim())));
    }

    private Manufacturer getOrCreateManufacturer(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new BusinessException("Имя изготовителя обязательно");
        }
        return manufacturerRepository.findByName(name.trim())
                .orElseGet(() -> manufacturerRepository.save(new Manufacturer(name.trim())));
    }

    private Representative getOrCreateRepresentative(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        return representativeRepository.findByName(name.trim())
                .orElseGet(() -> representativeRepository.save(new Representative(name.trim())));
    }

    private String requireStandardSection(String standardSection) {
        if (standardSection == null || standardSection.trim().isEmpty()) {
            throw new BusinessException("Поле 'Раздел (пункт, подпункт) стандарта' обязательно");
        }
        return standardSection.trim();
    }

    private String buildShortName(User user) {
        StringBuilder shortName = new StringBuilder();
        if (user.getSecondName() != null && !user.getSecondName().isBlank()) {
            shortName.append(user.getSecondName());
        }
        if (user.getFirstName() != null && !user.getFirstName().isBlank()) {
            if (shortName.length() > 0) shortName.append(" ");
            shortName.append(user.getFirstName().charAt(0)).append(".");
        }
        if (user.getPatronymic() != null && !user.getPatronymic().isBlank()) {
            if (shortName.length() > 0) shortName.append(" ");
            shortName.append(user.getPatronymic().charAt(0)).append(".");
        }
        return shortName.toString();
    }

    private void sendCertificateRegisteredNotifications(Certificate certificate) {
        List<User> accountants = userService.getUsersByRole(Role.ACCOUNTANT);
        String applicationNumber = certificate.getNumber() != null && !certificate.getNumber().isBlank()
                ? certificate.getNumber()
                : "ID: " + certificate.getId();

        String executorName = "Не назначен";
        if (certificate.getAssignedUserId() != null) {
            executorName = userService.getUserById(certificate.getAssignedUserId())
                    .map(this::buildShortName)
                    .orElse("Не назначен");
        }

        for (User accountant : accountants) {
            CertificateRegisteredNotification notification = new CertificateRegisteredNotification();
            notification.setRecipientEmail(accountant.getEmail());
            notification.setRecipientName(buildShortName(accountant));
            notification.setApplicationNumber(applicationNumber);
            notification.setApplicationDate(certificate.getApplicationDate());
            notification.setApplicantName(
                    certificate.getApplicant() != null ? certificate.getApplicant().getName() : "Не указан"
            );
            notification.setCertificateNumber(certificate.getCertificateNumber());
            notification.setExecutorName(executorName);
            notificationProducerService.sendCertificateRegisteredNotification(notification);
        }
    }
}

