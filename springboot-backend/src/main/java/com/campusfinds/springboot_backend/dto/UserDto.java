package com.campusfinds.springboot_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.campusfinds.springboot_backend.model.User;

/**
 * Shaped to match exactly what client/src/services/api.js already expects
 * (same field names the old Node/Express authController returned).
 */
public class UserDto {

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("student_id")
    private String studentId;

    private String fullname;
    private String email;
    private String role;
    private String status;

    public static UserDto from(User user) {
        UserDto dto = new UserDto();
        dto.userId = user.getUserId();
        dto.studentId = user.getStudentId();
        dto.fullname = user.getFullname();
        dto.email = user.getEmail();
        dto.role = user.getRole();
        dto.status = user.getStatus() == null ? "ACTIVE" : user.getStatus().name();
        return dto;
    }

    public Long getUserId() {
        return userId;
    }

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

    public String getStatus() {
        return status;
    }
}
