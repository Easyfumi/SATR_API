package ru.marinin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.marinin.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    public Optional<User> findByEmail(String email);
    public Boolean existsByEmail(String email);
}
