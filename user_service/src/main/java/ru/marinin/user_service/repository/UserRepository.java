package ru.marinin.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.marinin.user_service.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    public User findByEmail(String email);
}
