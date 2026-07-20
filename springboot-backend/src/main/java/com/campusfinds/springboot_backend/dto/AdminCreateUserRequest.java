package com.campusfinds.springboot_backend.dto;

import com.campusfinds.springboot_backend.model.UserStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AdminCreateUserRequest {

    @NotBlank(message = "Student ID is required.")
    @Size(max = 80, message = "Student ID must be 80 characters or fewer.")
    @JsonProperty("student_id")
    private String studentId;

    @NotBlank(message = "Full name is required.")
    @Size(max = 150, message = "Full name must be 150 characters or fewer.")
    private String fullname;

    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    @Size(max = 255, message = "Email must be 255 characters or fewer.")
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters.")
    private String password;

    @NotBlank(message = "Role is required.")
    private String role;

    @NotNull(message = "Status is required.")
    private UserStatus status = UserStatus.ACTIVE;

    public String getStudentId() {
        return studentId;
    }

    public String getFullname() {
        return fullname;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStudentId(String studentId) { this.studentId = studentId; }
    public void setFullname(String fullname) { this.fullname = fullname; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role) { this.role = role; }
    public void setStatus(UserStatus status) { this.status = status; }
}
