package ru.marinin.model.enums;

import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    USER, ADMIN, EMPTY;

    @Override
    public String getAuthority() {
        return name();
    }
}
