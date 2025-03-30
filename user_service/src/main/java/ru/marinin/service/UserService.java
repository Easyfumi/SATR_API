package ru.marinin.service;

import ru.marinin.model.User;

import java.util.List;

public interface UserService {
    public User getUserProfile(String jwt);
    public List<User> getAllUsers();
}
