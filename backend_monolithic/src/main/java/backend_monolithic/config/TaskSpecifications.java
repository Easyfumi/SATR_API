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

    // МЕТОД: Фильтрация по наличию договора
    public static Specification<Task> withHasContract(Boolean hasContract) {
        return (root, query, criteriaBuilder) -> {
            if (hasContract == null) {
                return criteriaBuilder.conjunction();
            }

            if (hasContract) {
                // Задачи с договором (contract не null)
                return criteriaBuilder.isNotNull(root.get("contract"));
            } else {
                // Задачи без договора (contract null)
                return criteriaBuilder.isNull(root.get("contract"));
            }
        };
    }

    // МЕТОД: Фильтрация по номеру договора
    public static Specification<Task> withContractNumber(String contractNumber) {
        return (root, query, criteriaBuilder) -> {
            if (contractNumber == null || contractNumber.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String searchPattern = "%" + contractNumber.toLowerCase() + "%";

            // Ищем по номеру договора (учитываем, что contract может быть null)
            Predicate hasContract = criteriaBuilder.isNotNull(root.get("contract"));
            Predicate numberMatches = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("contract").get("number")),
                    searchPattern
            );

            // Только задачи с договором И с соответствующим номером
            return criteriaBuilder.and(hasContract, numberMatches);
        };
    }

    public static Specification<Task> buildSpecification(TaskFilter filter) {
        Specification<Task> spec = Specification.where(null);

        // Если задан быстрый поиск, используем его
        if (filter.getQuickSearch() != null && !filter.getQuickSearch().isEmpty()) {
            spec = spec.and(withQuickSearch(filter.getQuickSearch()));
        } else {
            // Иначе используем отдельные фильтры
            spec = spec.and(withNumber(filter.getNumber()))
                    .and(withApplicant(filter.getApplicant()))
                    .and(withManufacturer(filter.getManufacturer()))
                    .and(withMark(filter.getMark()))
                    .and(withTypeName(filter.getTypeName()))
                    .and(withRepresentative(filter.getRepresentative()))
                    .and(withAssignedUser(filter.getAssignedUser()))
                    .and(withStatus(filter.getStatus()))
                    .and(withPaymentStatus(filter.getPaymentStatus()))
                    .and(withCreatedAtBetween(filter.getCreatedAtFrom(), filter.getCreatedAtTo()))
                    .and(withHasContract(filter.getHasContract())) // Фильтр по наличию договора
                    .and(withContractNumber(filter.getContractNumber())); // Фильтр по номеру договора
        }

        return spec;
    }

    public static Specification<Task> withQuickSearch(String quickSearch) {
        return (root, query, criteriaBuilder) -> {
            if (quickSearch == null || quickSearch.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String searchPattern = "%" + quickSearch.toLowerCase() + "%";

            // Условие для поиска по номеру задачи
            Predicate numberPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("number")),
                    searchPattern
            );

            // Условие для поиска по назначенному пользователю
            Predicate assignedUserPredicate = criteriaBuilder.conjunction();

            try {
                // Пытаемся парсить как ID пользователя
                Long userId = Long.parseLong(quickSearch);
                assignedUserPredicate = criteriaBuilder.equal(root.get("assignedUserId"), userId);
            } catch (NumberFormatException e) {
                // Если не число, ищем по ФИО пользователя через подзапрос
                Subquery<Long> userSubquery = query.subquery(Long.class);
                Root<User> userRoot = userSubquery.from(User.class);
                userSubquery.select(userRoot.get("id"));

                Predicate userSearchPredicate = criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(userRoot.get("secondName")), searchPattern),
                        criteriaBuilder.like(criteriaBuilder.lower(userRoot.get("firstName")), searchPattern),
                        criteriaBuilder.like(criteriaBuilder.lower(userRoot.get("patronymic")), searchPattern),
                        criteriaBuilder.like(criteriaBuilder.lower(userRoot.get("email")), searchPattern)
                );

                userSubquery.where(userSearchPredicate);
                assignedUserPredicate = criteriaBuilder.in(root.get("assignedUserId")).value(userSubquery);
            }

            // Условие для поиска по номеру договора
            Predicate contractNumberPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("contract").get("number")),
                    searchPattern
            );

            // Условие для поиска по заявителю (через договор)
            Predicate contractApplicantPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("contract").get("applicant").get("name")),
                    searchPattern
            );

            // Объединяем все условия через OR
            return criteriaBuilder.or(
                    numberPredicate,
                    assignedUserPredicate,
                    contractNumberPredicate,
                    contractApplicantPredicate
            );
        };
    }
}
