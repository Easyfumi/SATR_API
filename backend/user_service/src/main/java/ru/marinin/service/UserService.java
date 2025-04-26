package ru.marinin.service;

import ru.marinin.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    public User getUserProfile(String jwt);
    public List<User> getAllUsers();
    public Optional<User> getUserById(Long id);
}
