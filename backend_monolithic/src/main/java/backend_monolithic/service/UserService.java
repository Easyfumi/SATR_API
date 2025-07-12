package backend_monolithic.service;

import backend_monolithic.model.User;
import backend_monolithic.model.enums.Role;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserService {
    User getUserProfile(String jwt);
    List<User> getAllUsers();
    Optional<User> getUserById(Long id);
    User updateUserRoles(Long id, Set<Role> roles);
    List<User> getUsersByRole(Role role);
}
