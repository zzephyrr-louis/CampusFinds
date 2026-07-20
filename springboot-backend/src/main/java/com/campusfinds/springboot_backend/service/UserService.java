package com.campusfinds.springboot_backend.service;

import com.campusfinds.springboot_backend.dto.AdminCreateUserRequest;
import com.campusfinds.springboot_backend.dto.UpdateUserRequest;
import com.campusfinds.springboot_backend.dto.UserDto;
import com.campusfinds.springboot_backend.exception.ApiExceptions;
import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.repository.ItemClaimRepository;
import com.campusfinds.springboot_backend.repository.ItemRepository;
import com.campusfinds.springboot_backend.repository.NotificationRepository;
import com.campusfinds.springboot_backend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ItemClaimRepository claimRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;
    private final ActivityLogService activityLogService;

    public UserService(
            UserRepository userRepository,
            ItemRepository itemRepository,
            ItemClaimRepository claimRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder,
            CurrentUserService currentUserService,
            ActivityLogService activityLogService
    ) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public UserDto me() {
        return UserDto.from(currentUserService.requireCurrentUser());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<UserDto> all() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "userId")).stream()
                .map(UserDto::from)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public UserDto get(Long userId) {
        return UserDto.from(requireUser(userId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserDto create(AdminCreateUserRequest request) {
        User actor = currentUserService.requireCurrentUser();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String studentId = request.getStudentId().trim();
        ensureUnique(email, studentId, null);

        User user = new User(
                studentId,
                request.getFullname().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                normalizeRole(request.getRole()));
        user.setStatus(request.getStatus());
        User saved = userRepository.save(user);
        activityLogService.record(actor, "USER_CREATED",
                actor.getFullname() + " created account " + saved.getEmail() + ".");
        return UserDto.from(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserDto update(Long userId, UpdateUserRequest request) {
        User actor = currentUserService.requireCurrentUser();
        User user = requireUser(userId);
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String studentId = request.getStudentId().trim();
        String role = normalizeRole(request.getRole());
        ensureUnique(email, studentId, userId);

        if (actor.getUserId().equals(userId)
                && (!"admin".equals(role) || request.getStatus() != com.campusfinds.springboot_backend.model.UserStatus.ACTIVE)) {
            throw new ApiExceptions.ConflictException("You cannot demote or suspend your own administrator account.");
        }

        user.setStudentId(studentId);
        user.setFullname(request.getFullname().trim());
        user.setEmail(email);
        user.setRole(role);
        user.setStatus(request.getStatus());
        User saved = userRepository.save(user);
        activityLogService.record(actor, "USER_UPDATED",
                actor.getFullname() + " updated account " + saved.getEmail() + ".");
        return UserDto.from(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void delete(Long userId) {
        User actor = currentUserService.requireCurrentUser();
        User user = requireUser(userId);
        if (actor.getUserId().equals(userId)) {
            throw new ApiExceptions.ConflictException("You cannot delete your own administrator account.");
        }
        if (itemRepository.existsByReporterUserId(userId)
                || claimRepository.existsByClaimantUserId(userId)
                || claimRepository.existsByReviewedByUserId(userId)) {
            throw new ApiExceptions.ConflictException(
                    "This account has item or claim records. Suspend it instead of deleting it.");
        }

        notificationRepository.deleteByUserUserId(userId);
        activityLogService.detachActor(userId);
        userRepository.delete(user);
        activityLogService.record(actor, "USER_DELETED",
                actor.getFullname() + " deleted account " + user.getEmail() + ".");
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiExceptions.ResourceNotFoundException("User not found."));
    }

    private void ensureUnique(String email, String studentId, Long excludedUserId) {
        boolean duplicateEmail = excludedUserId == null
                ? userRepository.existsByEmailIgnoreCase(email)
                : userRepository.existsByEmailIgnoreCaseAndUserIdNot(email, excludedUserId);
        boolean duplicateStudentId = excludedUserId == null
                ? userRepository.existsByStudentId(studentId)
                : userRepository.existsByStudentIdAndUserIdNot(studentId, excludedUserId);
        if (duplicateEmail || duplicateStudentId) {
            throw new ApiExceptions.ConflictException(
                    "An account with that email or student ID already exists.");
        }
    }

    private static String normalizeRole(String role) {
        String normalized = role == null ? "" : role.trim().toLowerCase(Locale.ROOT);
        if (!normalized.equals("student") && !normalized.equals("admin")) {
            throw new ApiExceptions.BadRequestException("Role must be student or admin.");
        }
        return normalized;
    }
}
