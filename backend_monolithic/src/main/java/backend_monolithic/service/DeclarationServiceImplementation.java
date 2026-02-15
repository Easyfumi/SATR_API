package backend_monolithic.service;

import backend_monolithic.error.BusinessException;
import backend_monolithic.error.DuplicateNumberException;
import backend_monolithic.model.*;
import backend_monolithic.model.dto.*;
import backend_monolithic.model.enums.DeclarationStatus;
import backend_monolithic.model.enums.Role;
import backend_monolithic.repository.ApplicantRepository;
import backend_monolithic.repository.DeclarationRepository;
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
public class DeclarationServiceImplementation implements DeclarationService {

    private final DeclarationRepository declarationRepository;
    private final ApplicantRepository applicantRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final RepresentativeRepository representativeRepository;
    private final UserService userService;
    private final NotificationProducerService notificationProducerService;

    @Override
    @Transactional
    public DeclarationResponse createDeclaration(DeclarationRequest request, String jwt) {
        User user = userService.getUserProfile(jwt);
        Declaration declaration = mapRequestToEntity(request);

        declaration.setCreatedBy(user.getId());
        declaration.setCreatedAt(LocalDateTime.now());
        declaration.setStatus(DeclarationStatus.RECEIVED);

        return mapEntityToResponse(declarationRepository.save(declaration));
    }

    @Override
    public DeclarationResponse getDeclarationById(Long id) {
        Declaration declaration = declarationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Декларация не найдена"));
        return mapEntityToResponse(declaration);
    }

    @Override
    public List<DeclarationResponse> getAllDeclarations() {
        return declarationRepository.findAll().stream()
                .sorted(Comparator.comparing(Declaration::getCreatedAt).reversed())
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DeclarationResponse> getMyDeclarations(String jwt) {
        User user = userService.getUserProfile(jwt);
        return declarationRepository.findByAssignedUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DeclarationResponse updateDeclaration(Long declarationId, DeclarationRequest request) {
        Declaration declaration = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new EntityNotFoundException("Декларация не найдена"));

        if (declaration.getStatus() == DeclarationStatus.DECLARATION_REGISTERED) {
            throw new BusinessException("Нельзя редактировать зарегистрированную декларацию");
        }

        declaration.setApplicant(getOrCreateApplicant(request.getApplicantName()));
        declaration.setManufacturer(getOrCreateManufacturer(request.getManufacturerName()));
        declaration.setRepresentative(getOrCreateRepresentative(request.getRepresentativeName()));
        declaration.setCategories(request.getCategories());
        declaration.setMark(request.getMark());
        declaration.setTypeName(request.getTypeName());
        declaration.setModifications(request.getModifications());
        declaration.setCommercialNames(request.getCommercialNames());
        declaration.setStandardSection(requireStandardSection(request.getStandardSection()));
        declaration.setAssignedUserId(request.getAssignedUserId());

        return mapEntityToResponse(declarationRepository.save(declaration));
    }

    @Override
    @Transactional
    public void deleteDeclaration(Long declarationId) {
        Declaration declaration = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new EntityNotFoundException("Декларация не найдена"));

        if (declaration.getStatus() == DeclarationStatus.DECLARATION_REGISTERED) {
            throw new BusinessException("Нельзя удалить зарегистрированную декларацию");
        }

        declarationRepository.delete(declaration);
    }

    @Override
    @Transactional
    public DeclarationResponse setDeclarationNumber(Long declarationId, String number, LocalDate applicationDate) {
        if (declarationRepository.existsByNumber(number)) {
            throw new DuplicateNumberException("Номер " + number + " уже существует");
        }

        Declaration declaration = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new EntityNotFoundException("Декларация не найдена"));

        if (declaration.getNumber() != null) {
            throw new BusinessException("Номер уже назначен");
        }

        declaration.setNumber(number);
        declaration.setApplicationDate(applicationDate);
        declaration.setStatus(DeclarationStatus.JOURNAL_REGISTERED);
        return mapEntityToResponse(declarationRepository.save(declaration));
    }

    @Override
    @Transactional
    public DeclarationResponse updateStatus(Long declarationId, DeclarationStatus status, String declarationNumber) {
        Declaration declaration = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new EntityNotFoundException("Декларация не найдена"));

        if (declaration.getStatus() == DeclarationStatus.DECLARATION_REGISTERED) {
            throw new BusinessException("Нельзя изменить статус зарегистрированной декларации");
        }

        if (status == DeclarationStatus.RECEIVED || status == DeclarationStatus.JOURNAL_REGISTERED) {
            throw new BusinessException("Этот статус устанавливается автоматически");
        }

        if (status == DeclarationStatus.DECLARATION_REGISTERED) {
            if (declarationNumber == null || declarationNumber.isBlank()) {
                throw new BusinessException("Номер зарегистрированной декларации обязателен");
            }
            String normalizedDeclarationNumber = declarationNumber.trim();
            if (declarationRepository.existsByDeclarationNumberAndIdNot(normalizedDeclarationNumber, declarationId)) {
                throw new DuplicateNumberException("Номер декларации " + normalizedDeclarationNumber + " уже существует");
            }
            declaration.setDeclarationNumber(normalizedDeclarationNumber);
            declaration.setDeclarationRegisteredAt(LocalDate.now());
            declaration.setStatus(DeclarationStatus.DECLARATION_REGISTERED);
            declaration = declarationRepository.save(declaration);
            sendDeclarationRegisteredNotifications(declaration);
            return mapEntityToResponse(declaration);
        }

        declaration.setStatus(status);
        return mapEntityToResponse(declarationRepository.save(declaration));
    }

    @Override
    @Transactional
    public DeclarationResponse updateDeclarationExpert(Long declarationId, Long assignedUserId) {
        Declaration declaration = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new EntityNotFoundException("Декларация не найдена"));

        if (assignedUserId == null) {
            declaration.setAssignedUserId(null);
        } else {
            User user = userService.getUserById(assignedUserId)
                    .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));
            if (user.getRoles() == null || !user.getRoles().contains(Role.EXPERT)) {
                throw new BusinessException("Пользователь не является экспертом");
            }
            declaration.setAssignedUserId(assignedUserId);
        }

        return mapEntityToResponse(declarationRepository.save(declaration));
    }

    @Override
    public List<DeclarationDuplicateInfo> checkDuplicates(DeclarationRequest request) {
        List<Declaration> existing = declarationRepository.findByStatusNot(DeclarationStatus.DECLARATION_REGISTERED);
        Declaration incoming = mapRequestToEntityForComparison(request);

        return existing.stream()
                .filter(declaration -> areDeclarationsDuplicates(declaration, incoming))
                .map(declaration -> new DeclarationDuplicateInfo(
                        declaration.getId(),
                        getDisplayIdentifier(declaration),
                        declaration.getStatus(),
                        declaration.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    private Declaration mapRequestToEntity(DeclarationRequest request) {
        Declaration declaration = new Declaration();
        declaration.setApplicant(getOrCreateApplicant(request.getApplicantName()));
        declaration.setManufacturer(getOrCreateManufacturer(request.getManufacturerName()));
        declaration.setRepresentative(getOrCreateRepresentative(request.getRepresentativeName()));
        declaration.setCategories(request.getCategories());
        declaration.setMark(request.getMark());
        declaration.setTypeName(request.getTypeName());
        declaration.setModifications(request.getModifications());
        declaration.setCommercialNames(request.getCommercialNames());
        declaration.setStandardSection(requireStandardSection(request.getStandardSection()));
        declaration.setAssignedUserId(request.getAssignedUserId());
        return declaration;
    }

    private Declaration mapRequestToEntityForComparison(DeclarationRequest request) {
        Declaration declaration = new Declaration();
        if (request.getApplicantName() != null && !request.getApplicantName().trim().isEmpty()) {
            declaration.setApplicant(new Applicant(request.getApplicantName().trim()));
        }
        if (request.getManufacturerName() != null && !request.getManufacturerName().trim().isEmpty()) {
            declaration.setManufacturer(new Manufacturer(request.getManufacturerName().trim()));
        }
        if (request.getRepresentativeName() != null && !request.getRepresentativeName().trim().isEmpty()) {
            declaration.setRepresentative(new Representative(request.getRepresentativeName().trim()));
        }
        declaration.setCategories(request.getCategories());
        declaration.setMark(request.getMark());
        declaration.setTypeName(request.getTypeName());
        declaration.setModifications(request.getModifications());
        declaration.setCommercialNames(request.getCommercialNames());
        declaration.setStandardSection(request.getStandardSection());
        return declaration;
    }

    private DeclarationResponse mapEntityToResponse(Declaration declaration) {
        DeclarationResponse response = new DeclarationResponse();
        response.setId(declaration.getId());
        response.setNumber(declaration.getNumber());
        response.setApplicationDate(declaration.getApplicationDate());
        response.setApplicant(declaration.getApplicant() != null ? declaration.getApplicant().getName() : null);
        response.setManufacturer(declaration.getManufacturer() != null ? declaration.getManufacturer().getName() : null);
        response.setRepresentative(declaration.getRepresentative() != null ? declaration.getRepresentative().getName() : null);
        response.setCategories(declaration.getCategories());
        response.setMark(declaration.getMark());
        response.setTypeName(declaration.getTypeName());
        response.setModifications(declaration.getModifications());
        response.setCommercialNames(declaration.getCommercialNames());
        response.setStandardSection(declaration.getStandardSection());
        response.setStatus(declaration.getStatus() != null ? declaration.getStatus().name() : null);
        response.setAssignedUserId(declaration.getAssignedUserId());
        response.setDeclarationNumber(declaration.getDeclarationNumber());
        response.setDeclarationRegisteredAt(declaration.getDeclarationRegisteredAt());
        response.setCreatedAt(declaration.getCreatedAt());

        if (declaration.getCreatedBy() != null) {
            userService.getUserById(declaration.getCreatedBy())
                    .ifPresent(user -> response.setCreatedBy(buildShortName(user)));
        }

        if (declaration.getAssignedUserId() != null) {
            userService.getUserById(declaration.getAssignedUserId())
                    .ifPresent(user -> response.setAssignedUser(new UserInfo(user)));
        }

        return response;
    }

    private boolean areDeclarationsDuplicates(Declaration left, Declaration right) {
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

    private String getDisplayIdentifier(Declaration declaration) {
        if (declaration.getNumber() != null && !declaration.getNumber().trim().isEmpty()) {
            return declaration.getNumber();
        }
        return String.format("ID: %d (%s)",
                declaration.getId(),
                declaration.getCreatedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
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

    private void sendDeclarationRegisteredNotifications(Declaration declaration) {
        List<User> accountants = userService.getUsersByRole(Role.ACCOUNTANT);
        String applicationNumber = declaration.getNumber() != null && !declaration.getNumber().isBlank()
                ? declaration.getNumber()
                : "ID: " + declaration.getId();

        String executorName = "Не назначен";
        if (declaration.getAssignedUserId() != null) {
            executorName = userService.getUserById(declaration.getAssignedUserId())
                    .map(this::buildShortName)
                    .orElse("Не назначен");
        }

        for (User accountant : accountants) {
            DeclarationRegisteredNotification notification = new DeclarationRegisteredNotification();
            notification.setRecipientEmail(accountant.getEmail());
            notification.setRecipientName(buildShortName(accountant));
            notification.setApplicationNumber(applicationNumber);
            notification.setApplicationDate(declaration.getApplicationDate());
            notification.setApplicantName(
                    declaration.getApplicant() != null ? declaration.getApplicant().getName() : "Не указан"
            );
            notification.setDeclarationNumber(declaration.getDeclarationNumber());
            notification.setExecutorName(executorName);
            notificationProducerService.sendDeclarationRegisteredNotification(notification);
        }
    }
}
