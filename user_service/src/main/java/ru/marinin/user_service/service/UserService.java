package ru.marinin.user_service.service;

import ru.marinin.user_service.model.User;

import java.util.List;

public interface UserService {
    public User getUserProfile(String jwt);
    public List<User> getAllUsers();
}
