package ru.marinin.model;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private long id;

    private String email;

    private String password;

    private String firstName;

    private String secondName;

    private String patronymic;
}
