package com.campusfinds.springboot_backend.service;

import com.campusfinds.springboot_backend.exception.ApiExceptions;
import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.model.UserStatus;
import com.campusfinds.springboot_backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ApiExceptions.ForbiddenOperationException("Authentication is required.");
        }

        final long userId;
        try {
            userId = Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new ApiExceptions.ForbiddenOperationException("The authenticated user is invalid.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiExceptions.ForbiddenOperationException(
                        "The authenticated account no longer exists."));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiExceptions.ForbiddenOperationException("This account is suspended.");
        }
        return user;
    }
}
