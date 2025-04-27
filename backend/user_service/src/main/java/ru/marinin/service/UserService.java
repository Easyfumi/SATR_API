package ru.marinin.service;

import ru.marinin.model.User;
import ru.marinin.model.enums.Role;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserService {
    User getUserProfile(String jwt);
    List<User> getAllUsers();
    Optional<User> getUserById(Long id);
    User updateUserRoles(Long id, Set<Role> roles);
}
