package backend_monolithic.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TaskStatus {
    RECEIVED("Получена"),
    REGISTERED("Зарегистрирована"),
    DECISION_DONE("Решение подготовлено"),
    PREPARING_LAYOUT("Подготовка макета"),
    DOCUMENT_VERIFICATION("Проверка документов"),
    DOCUMENTS_WAITING("Ожидание документов"),
    REJECTION("Отказ"),
    CANCELLED("Аннулирована"),
    PROJECT("Проект"),
    SIGNED("Подписано"),
    FOR_REVISION("На доработку"),
    COMPLETED("Завершена"),
    ARCHIVED("Передано в архив");

    /** Порядок статусов по умолчанию в списках заявок (taskList / myTaskList). */
    public static final TaskStatus[] LIST_SORT_ORDER = {
            RECEIVED,
            REGISTERED,
            DECISION_DONE,
            PREPARING_LAYOUT,
            DOCUMENT_VERIFICATION,
            DOCUMENTS_WAITING,
            PROJECT,
            SIGNED,
            FOR_REVISION,
            COMPLETED,
            ARCHIVED,
            REJECTION,
            CANCELLED
    };

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static int listSortIndex(TaskStatus status) {
        if (status == null) {
            return LIST_SORT_ORDER.length;
        }
        for (int i = 0; i < LIST_SORT_ORDER.length; i++) {
            if (LIST_SORT_ORDER[i] == status) {
                return i;
            }
        }
        return LIST_SORT_ORDER.length;
    }

    @JsonValue
    public String toValue() {
        return this.name(); // Сериализуется как "RECEIVED"
    }

    @JsonCreator
    public static TaskStatus fromValue(String value) {
        // Принимает как "RECEIVED" (из БД), так и "Получена" (с фронтенда)
        try {
            return valueOf(value);
        } catch (IllegalArgumentException e) {
            // Если пришло значение на русском, конвертируем
            for (TaskStatus status : values()) {
                if (status.displayName.equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unknown TaskStatus: " + value);
        }
    }
}
