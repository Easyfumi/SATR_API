package ru.marinin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ru.marinin.config.JwtProvider;
import ru.marinin.controller.UserController;
import ru.marinin.model.User;
import ru.marinin.model.enums.Role;
import ru.marinin.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImplementation implements UserService{

    private final UserRepository userRepository;


    @Override
    public User getUserProfile(String jwt) {
        String email = JwtProvider.getEmailFromJwtToken(jwt);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        return userOptional;
    }

    @Override
    public User updateUserRoles(Long id, Set<Role> roles) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserController.UserNotFoundException("User not found with id: " + id));

        user.setRoles(roles);
        return userRepository.save(user);
    }
    @Override
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

}
