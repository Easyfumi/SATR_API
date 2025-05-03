package ru.marinin.exceptions;

public class DuplicateNumberException extends RuntimeException {
    public DuplicateNumberException(String message) {
        super(message);
    }
}
