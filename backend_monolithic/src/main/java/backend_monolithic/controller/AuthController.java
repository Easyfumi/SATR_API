package backend_monolithic.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import backend_monolithic.config.JwtProvider;
import backend_monolithic.error.ErrorResponse;
import backend_monolithic.model.User;
import backend_monolithic.model.dto.UserRegistrationNotification;
import backend_monolithic.model.enums.Role;
import backend_monolithic.repository.UserRepository;
import backend_monolithic.request.LoginRequest;
import backend_monolithic.response.AuthResponse;
import backend_monolithic.service.CustomUserServiceImplementation;
import backend_monolithic.service.NotificationProducerService;
import backend_monolithic.service.UserService;

import java.util.Collections;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserServiceImplementation customUserServiceImplementation;
    private final UserService userService;
    private final NotificationProducerService notificationProducerService;

    @PostMapping("/signup")
    public ResponseEntity<?> createUserHandler(
            @RequestBody User user) throws Exception {

        String email = user.getEmail();
        String password = user.getPassword();
        String firstName = user.getFirstName();
        String patronymic = user.getPatronymic();
        String secondName = user.getSecondName();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("message", "Адрес электронной почты уже используется"));
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFirstName(firstName);
        newUser.setPatronymic(patronymic);
        newUser.setSecondName(secondName);
        newUser.getRoles().add(Role.EMPTY);
        newUser.setPassword(passwordEncoder.encode(password));

        User savedUser = userRepository.save(newUser);

        // Отправка уведомлений всем пользователям с ролью "Директор"
        // Обернуто в try-catch, чтобы ошибка отправки не прерывала регистрацию
        try {
            List<User> directors = userService.getUsersByRole(Role.DIRECTOR);
            for (User director : directors) {
                try {
                    UserRegistrationNotification notification = new UserRegistrationNotification();
                    notification.setRecipientEmail(director.getEmail());
                    notification.setRecipientName(buildShortName(director));
                    notification.setNewUserEmail(savedUser.getEmail());
                    notification.setNewUserFirstName(savedUser.getFirstName());
                    notification.setNewUserSecondName(savedUser.getSecondName());
                    notification.setNewUserPatronymic(savedUser.getPatronymic());
                    
                    notificationProducerService.sendUserRegistrationNotification(notification);
                } catch (Exception e) {
                    // Логируем ошибку, но продолжаем регистрацию
                    System.err.println("Ошибка отправки уведомления директору " + director.getEmail() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            // Логируем ошибку, но продолжаем регистрацию
            System.err.println("Ошибка при отправке уведомлений о регистрации: " + e.getMessage());
            e.printStackTrace();
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(email, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = JwtProvider.generateToken(authentication);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(token);
        authResponse.setMessage("Register success");
        authResponse.setStatus(true);

        return ResponseEntity.ok(authResponse);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(ex.getMessage()));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody LoginRequest loginRequest) {
        try {
        String username = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Authentication authentication = authenticate(username, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = JwtProvider.generateToken(authentication);
        AuthResponse authResponse = new AuthResponse();

        authResponse.setMessage("Login success");
        authResponse.setJwt(token);
        authResponse.setStatus(true);

            return ResponseEntity.ok(authResponse);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Неверный адрес электронной почты или пароль"));
        }
    }

    // todo
//    Обработать возникновение
//    org.springframework.security.authentication.BadCredentialsException: Invalid token...

    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = customUserServiceImplementation.loadUserByUsername(username);

        if (userDetails == null) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    private String buildShortName(User user) {
        StringBuilder shortName = new StringBuilder();
        if (user.getSecondName() != null && !user.getSecondName().isBlank()) {
            shortName.append(user.getSecondName());
        }
        if (user.getFirstName() != null && !user.getFirstName().isBlank()) {
            if (shortName.length() > 0) {
                shortName.append(" ");
            }
            shortName.append(user.getFirstName().charAt(0)).append(".");
        }
        if (user.getPatronymic() != null && !user.getPatronymic().isBlank()) {
            if (shortName.length() > 0) {
                shortName.append(" ");
            }
            shortName.append(user.getPatronymic().charAt(0)).append(".");
        }
        return shortName.toString();
    }

}
