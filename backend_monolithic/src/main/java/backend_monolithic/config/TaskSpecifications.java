package backend_monolithic.config;

import backend_monolithic.model.Task;
import backend_monolithic.model.User;
import backend_monolithic.model.dto.TaskFilter;
import backend_monolithic.model.enums.TaskStatus;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;

@Component
public class TaskSpecifications {

    public static Specification<Task> withNumber(String number) {
        return (root, query, criteriaBuilder) -> {
            if (number == null || number.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("number")),
                    "%" + number.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Task> withApplicant(String applicant) {
        return (root, query, criteriaBuilder) -> {
            if (applicant == null || applicant.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            // Делаем join с сущностью Applicant и сравниваем его имя
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.join("applicant").get("name")),
                    "%" + applicant.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Task> withManufacturer(String manufacturer) {
        return (root, query, criteriaBuilder) -> {
            if (manufacturer == null || manufacturer.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.join("manufacturer").get("name")),
                    "%" + manufacturer.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Task> withRepresentative(String representative) {
        return (root, query, criteriaBuilder) -> {
            if (representative == null || representative.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.join("representative").get("name")),
                    "%" + representative.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Task> withMark(String mark) {
        return (root, query, criteriaBuilder) -> {
            if (mark == null || mark.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("mark")),
                    "%" + mark.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Task> withTypeName(String typeName) {
        return (root, query, criteriaBuilder) -> {
            if (typeName == null || typeName.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("typeName")),
                    "%" + typeName.toLowerCase() + "%"
            );
        };
    }


    public static Specification<Task> withAssignedUser(String assignedUser) {
        return (root, query, criteriaBuilder) -> {
            if (assignedUser == null || assignedUser.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            // Если пользователь ввел "не назначен" или подобное
            if (assignedUser.toLowerCase().contains("не назначен") ||
                    assignedUser.toLowerCase().contains("не назначен")) {
                return root.get("assignedUserId").isNull();
            }

            try {
                // Пытаемся парсить как ID
                Long userId = Long.parseLong(assignedUser);
                return criteriaBuilder.equal(root.get("assignedUserId"), userId);
            } catch (NumberFormatException e) {
                // Если не число, ищем по ФИО через подзапрос
                Subquery<Long> userSubquery = query.subquery(Long.class);
                Root<User> userRoot = userSubquery.from(User.class);
                userSubquery.select(userRoot.get("id"));

                // Ищем по фамилии, имени или отчеству
                Predicate namePredicate = criteriaBuilder.or(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(userRoot.get("secondName")),
                                "%" + assignedUser.toLowerCase() + "%"
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(userRoot.get("firstName")),
                                "%" + assignedUser.toLowerCase() + "%"
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(userRoot.get("patronymic")),
                                "%" + assignedUser.toLowerCase() + "%"
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.concat(
                                        criteriaBuilder.concat(userRoot.get("secondName"), " "),
                                        criteriaBuilder.concat(userRoot.get("firstName"), " ")
                                ),
                                "%" + assignedUser + "%"
                        )
                );

                userSubquery.where(namePredicate);
                return criteriaBuilder.in(root.get("assignedUserId")).value(userSubquery);
            }
        };
    }

    public static Specification<Task> withStatus(TaskStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<Task> withPaymentStatus(Boolean paymentStatus) {
        return (root, query, criteriaBuilder) -> {
            if (paymentStatus == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus);
        };
    }

    public static Specification<Task> withCreatedAtBetween(LocalDate from, LocalDate to) {
        return (root, query, criteriaBuilder) -> {
            if (from == null && to == null) {
                return criteriaBuilder.conjunction();
            }

            if (from != null && to != null) {
                return criteriaBuilder.between(
                        root.get("createdAt"),
                        from.atStartOfDay(),
                        to.atTime(LocalTime.MAX)
                );
            } else if (from != null) {
                return criteriaBuilder.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        from.atStartOfDay()
                );
            } else {
                return criteriaBuilder.lessThanOrEqualTo(
                        root.get("createdAt"),
                        to.atTime(LocalTime.MAX)
                );
            }
        };
    }

    public static Specification<Task> buildSpecification(TaskFilter filter) {
        return Specification.where(withNumber(filter.getNumber()))
                .and(withApplicant(filter.getApplicant()))
                .and(withManufacturer(filter.getManufacturer()))
                .and(withMark(filter.getMark()))
                .and(withTypeName(filter.getTypeName()))
                .and(withRepresentative(filter.getRepresentative()))
                .and(withAssignedUser(filter.getAssignedUser()))
                .and(withStatus(filter.getStatus()))
                .and(withPaymentStatus(filter.getPaymentStatus()))
                .and(withCreatedAtBetween(filter.getCreatedAtFrom(), filter.getCreatedAtTo()));
    }
}
