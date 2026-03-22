package backend_monolithic.service;

import backend_monolithic.model.User;
import backend_monolithic.model.dto.ProfileAnalyticsResponse;
import backend_monolithic.model.enums.CertificateStatus;
import backend_monolithic.model.enums.DeclarationStatus;
import backend_monolithic.model.enums.TaskStatus;
import backend_monolithic.repository.CertificateRepository;
import backend_monolithic.repository.DeclarationRepository;
import backend_monolithic.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileAnalyticsServiceImplementation implements ProfileAnalyticsService {

    private static final Set<TaskStatus> TASK_NOT_ACTIVE_STATUSES = Set.of(
            TaskStatus.CANCELLED,
            TaskStatus.REJECTION,
            TaskStatus.COMPLETED
    );

    private final UserService userService;
    private final TaskRepository taskRepository;
    private final DeclarationRepository declarationRepository;
    private final CertificateRepository certificateRepository;

    @Override
    public ProfileAnalyticsResponse getMyAnalytics(String jwt, LocalDate startDate, LocalDate endDate) {
        LocalDate from = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate to = endDate != null ? endDate : LocalDate.now();
        if (to.isBefore(from)) {
            LocalDate temp = from;
            from = to;
            to = temp;
        }

        User user = userService.getUserProfile(jwt);
        Long userId = user.getId();

        long activeTasks = taskRepository.countByAssignedUserIdAndStatusNotIn(userId, TASK_NOT_ACTIVE_STATUSES);
        long activeDeclarations = declarationRepository.countByAssignedUserIdAndStatusNot(
                userId,
                DeclarationStatus.DECLARATION_REGISTERED
        );
        long activeCertificates = certificateRepository.countActiveByUser(userId, CertificateStatus.CERTIFICATE_REGISTERED);

        long completedTasks = taskRepository.countCompletedInPeriod(
                userId,
                TaskStatus.COMPLETED,
                from,
                to
        );
        long completedDeclarations = declarationRepository.countByAssignedUserIdAndDeclarationRegisteredAtBetween(
                userId,
                from,
                to
        );
        long completedCertificates = certificateRepository.countByRegisteredByUserIdAndCertificateRegisteredAtBetween(
                userId,
                from,
                to
        );

        return new ProfileAnalyticsResponse(
                from,
                to,
                activeTasks,
                activeDeclarations,
                activeCertificates,
                completedTasks,
                completedDeclarations,
                completedCertificates
        );
    }
}
