package backend_monolithic.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import backend_monolithic.model.User;
import backend_monolithic.model.enums.Role;

import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserInfo {

    private long id;

    private String email;

    private String firstName;

    private String secondName;

    private String patronymic;

    private Set<Role> roles = new HashSet<>();

    public UserInfo(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.secondName = user.getSecondName();
        this.patronymic = user.getPatronymic();
        this.roles = user.getRoles();
    }
}
