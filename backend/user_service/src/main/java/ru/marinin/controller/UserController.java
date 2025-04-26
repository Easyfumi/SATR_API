package ru.marinin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.marinin.model.User;
import ru.marinin.model.UserInfo;
import ru.marinin.service.UserService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(
            @RequestHeader("Authorization") String jwt) {
        User user = userService.getUserProfile(jwt);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getUsers(
            @RequestHeader("Authorization") String jwt) {
        List<User> users = userService.getAllUsers();
        System.out.println(users);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserInfo> getTaskById(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String jwt) throws Exception {

        Optional<User> userOptional = userService.getUserById(id);
        ResponseEntity<UserInfo> response = userOptional.isPresent() ?
                new ResponseEntity<>(new UserInfo(userOptional.get()), HttpStatus.OK) :
                new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return response;
    }

}
