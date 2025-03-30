package ru.marinin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.marinin.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    public User findByEmail(String email);
}
