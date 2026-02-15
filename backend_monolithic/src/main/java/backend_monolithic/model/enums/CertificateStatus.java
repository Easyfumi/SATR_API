package backend_monolithic.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CertificateStatus {
    RECEIVED("Заявка получена"),
    JOURNAL_REGISTERED("Заявка зарегистрирована в журнале"),
    FGIS_ENTERED("Заявка занесена во ФГИС"),
    CERTIFICATE_REGISTERED("Сертификат зарегистрирован");

    private final String displayName;

    CertificateStatus(String displayName) {
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
    public static CertificateStatus fromValue(String value) {
        try {
            return valueOf(value);
        } catch (IllegalArgumentException e) {
            for (CertificateStatus status : values()) {
                if (status.displayName.equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unknown CertificateStatus: " + value);
        }
    }
}

