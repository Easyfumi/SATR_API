package backend_monolithic.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DecisionFileException.class)
    public ResponseEntity<Map<String, String>> handleDecisionFileException(DecisionFileException exception) {
        return ResponseEntity.status(exception.getStatus())
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceeded() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("message", "Размер файла не должен превышать 5 МБ"));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<Map<String, String>> handleMissingFile() {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Файл не передан"));
    }

    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleTaskNotFound(TaskNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", exception.getMessage()));
    }
}
