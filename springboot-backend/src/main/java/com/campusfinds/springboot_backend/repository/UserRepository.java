package com.campusfinds.springboot_backend.repository;

import com.campusfinds.springboot_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailOrStudentId(String email, String studentId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByStudentId(String studentId);

    boolean existsByEmailIgnoreCaseAndUserIdNot(String email, Long userId);

    boolean existsByStudentIdAndUserIdNot(String studentId, Long userId);
}
