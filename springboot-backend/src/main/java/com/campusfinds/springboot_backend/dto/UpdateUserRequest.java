package com.campusfinds.springboot_backend.dto;

import com.campusfinds.springboot_backend.model.UserStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateUserRequest {

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

    @NotBlank(message = "Role is required.")
    private String role;

    @NotNull(message = "Status is required.")
    private UserStatus status;

    public String getStudentId() {
        return studentId;
    }

    public String getFullname() {
        return fullname;
    }

    public String getEmail() {
        return email;
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
    public void setRole(String role) { this.role = role; }
    public void setStatus(UserStatus status) { this.status = status; }
}
