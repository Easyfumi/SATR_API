package backend_monolithic.error;

public class DuplicateNumberException extends RuntimeException {
    public DuplicateNumberException(String message) {
        super(message);
    }
}
