package ru.marinin.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import ru.marinin.model.UserDto;

@FeignClient(name="user_service", url="http://localhost:5001")
public interface UserService {


    @GetMapping("/api/users/profile")
    public UserDto getUserProfile(@RequestHeader("Authorization") String jwt);

}
