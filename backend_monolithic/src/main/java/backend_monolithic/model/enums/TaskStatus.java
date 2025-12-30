package backend_monolithic.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TaskStatus {
    RECEIVED("Получена"),
    REGISTERED("Зарегистрирована"),
    DECISION_DONE("Решение подготовлено"),
    DOCUMENTS_WAITING("Ожидание документов"),
    REJECTION("Отказ"),
    CANCELLED("Аннулирована"),
    PROJECT("Проект"),
    SIGNED("Подписано"),
    FOR_REVISION("На доработку"),
    COMPLETED("Завершена");

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
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
