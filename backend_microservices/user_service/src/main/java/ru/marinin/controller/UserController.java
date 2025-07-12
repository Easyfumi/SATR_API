package ru.marinin.controller;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.marinin.error.ErrorResponse;
import ru.marinin.model.User;
import ru.marinin.model.UserInfo;
import ru.marinin.model.enums.Role;
import ru.marinin.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(
            @RequestHeader("Authorization") String jwt) {
        User user = userService.getUserProfile(jwt);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getUsers(
            @RequestHeader("Authorization") String jwt) {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserInfo> getUserById(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String jwt) throws Exception {

        Optional<User> userOptional = userService.getUserById(id);
        ResponseEntity<UserInfo> response = userOptional.isPresent() ?
                new ResponseEntity<>(new UserInfo(userOptional.get()), HttpStatus.OK) :
                new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return response;
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<?> updateUserRoles(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request,
            @RequestHeader("Authorization") String jwt) {

        try {
            // Преобразуем строки в enum Role с проверкой
            Set<Role> roles = request.getRoles().stream()
                    .map(role -> {
                        try {
                            return Role.valueOf(role.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            throw new InvalidRoleException("Invalid role: " + role);
                        }
                    })
                    .collect(Collectors.toSet());

            User updatedUser = userService.updateUserRoles(id, roles);
            return ResponseEntity.ok(new UserInfo(updatedUser));

        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (InvalidRoleException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/experts")
    public ResponseEntity<List<UserInfo>> getExperts(
            @RequestHeader("Authorization") String jwt) {
        List<User> experts = userService.getUsersByRole(Role.EXPERT);
        List<UserInfo> expertInfos = experts.stream()
                .map(UserInfo::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(expertInfos);
    }

    // DTO для запроса

    public static class RoleUpdateRequest {
        private Set<String> roles;

        // Геттеры и сеттеры
        public Set<String> getRoles() { return roles; }
        public void setRoles(Set<String> roles) { this.roles = roles; }
    }

    // Исключения
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(String message) { super(message); }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class InvalidRoleException extends RuntimeException {
        public InvalidRoleException(String message) { super(message); }
    }
}
