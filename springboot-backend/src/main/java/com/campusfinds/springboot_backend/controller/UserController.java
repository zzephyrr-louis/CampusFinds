package com.campusfinds.springboot_backend.controller;

import com.campusfinds.springboot_backend.dto.AdminCreateUserRequest;
import com.campusfinds.springboot_backend.dto.UpdateUserRequest;
import com.campusfinds.springboot_backend.dto.UserDto;
import com.campusfinds.springboot_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDto> all() {
        return userService.all();
    }

    @GetMapping("/me")
    public UserDto me() {
        return userService.me();
    }

    @GetMapping("/{userId}")
    public UserDto get(@PathVariable Long userId) {
        return userService.get(userId);
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{userId}")
    public UserDto update(@PathVariable Long userId, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(userId, request);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete(@PathVariable Long userId) {
        userService.delete(userId);
        return ResponseEntity.noContent().build();
    }
}
