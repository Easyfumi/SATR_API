package backend_monolithic.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class DecisionFileException extends RuntimeException {
    private final HttpStatus status;

    public DecisionFileException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public DecisionFileException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }
}
