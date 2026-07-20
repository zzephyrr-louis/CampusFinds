package com.campusfinds.springboot_backend.config;

import com.campusfinds.springboot_backend.model.User;
import com.campusfinds.springboot_backend.model.UserStatus;
import com.campusfinds.springboot_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.logging.Logger;

@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger LOGGER = Logger.getLogger(AdminBootstrap.class.getName());

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String studentId;
    private final String fullname;
    private final String email;
    private final String password;

    public AdminBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.student-id:ADMIN-0001}") String studentId,
            @Value("${app.admin.fullname:CampusFind Administrator}") String fullname,
            @Value("${app.admin.email:}") String email,
            @Value("${app.admin.password:}") String password
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentId = studentId;
        this.fullname = fullname;
        this.email = email;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email == null || email.isBlank()) return;
        if (password == null || password.length() < 8) {
            LOGGER.warning("ADMIN_EMAIL is set, but ADMIN_PASSWORD is missing or shorter than 8 characters; bootstrap skipped.");
            return;
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)
                || userRepository.existsByStudentId(studentId.trim())) {
            return;
        }

        User admin = new User(
                studentId.trim(),
                fullname.trim(),
                normalizedEmail,
                passwordEncoder.encode(password),
                "admin");
        admin.setStatus(UserStatus.ACTIVE);
        userRepository.save(admin);
        LOGGER.info("Configured CampusFind administrator account was created.");
    }
}
