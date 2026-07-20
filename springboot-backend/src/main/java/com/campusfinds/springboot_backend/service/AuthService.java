package com.campusfinds.springboot_backend.service;

import com.campusfinds.springboot_backend.dto.AuthResponse;
import com.campusfinds.springboot_backend.dto.LoginRequest;
import com.campusfinds.springboot_backend.dto.RegisterRequest;
import com.campusfinds.springboot_backend.dto.UserDto;
import com.campusfinds.springboot_backend.exception.ApiExceptions;
import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.model.UserStatus;
import com.campusfinds.springboot_backend.repository.UserRepository;
import com.campusfinds.springboot_backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String studentId = request.getStudentId().trim();

        userRepository.findByEmailOrStudentId(email, studentId).ifPresent(existing -> {
            throw new ApiExceptions.AccountConflictException(
                    "An account with that email or student ID already exists.");
        });

        User user = new User(
                studentId,
                request.getFullname().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                "student"
        );
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        return new AuthResponse("Registration successful.", token, UserDto.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiExceptions.InvalidCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiExceptions.InvalidCredentialsException("Invalid email or password.");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiExceptions.ForbiddenOperationException("This account is suspended.");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse("Login successful.", token, UserDto.from(user));
    }
}
