package ru.marinin.model.enums;

import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    EXPERT, DIRECTOR, REGISTRAR, ACCOUNTANT, EMPTY;

    @Override
    public String getAuthority() {
        return name();
    }
}
