package ru.marinin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.marinin.config.JwtProvider;
import ru.marinin.model.User;
import ru.marinin.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImplementation implements UserService{

    private final UserRepository userRepository;


    @Override
    public User getUserProfile(String jwt) {
        String email = JwtProvider.getEmailFromJwtToken(jwt);
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
