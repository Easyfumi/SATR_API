package ru.marinin.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.marinin.model.enums.Role;

import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserInfo {

    private long id;

    private String email;

    private String firstName;

    private String secondName;

    private String patronymic;

    private Set<Role> roles = new HashSet<>();
}
