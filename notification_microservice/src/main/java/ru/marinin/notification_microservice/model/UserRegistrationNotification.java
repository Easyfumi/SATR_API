package ru.marinin.notification_microservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationNotification {
    private String recipientEmail;
    private String recipientName;
    private String newUserEmail;
    private String newUserFirstName;
    private String newUserSecondName;
    private String newUserPatronymic;
}
