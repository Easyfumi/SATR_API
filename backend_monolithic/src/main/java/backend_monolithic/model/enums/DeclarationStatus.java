package backend_monolithic.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DeclarationStatus {
    RECEIVED("Заявка получена"),
    JOURNAL_REGISTERED("Заявка зарегистрирована в журнале"),
    FGIS_ENTERED("Заявка занесена во ФГИС"),
    DECLARATION_REGISTERED("Декларация зарегистрирована");

    private final String displayName;

    DeclarationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static DeclarationStatus fromValue(String value) {
        try {
            return valueOf(value);
        } catch (IllegalArgumentException e) {
            for (DeclarationStatus status : values()) {
                if (status.displayName.equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unknown DeclarationStatus: " + value);
        }
    }
}
