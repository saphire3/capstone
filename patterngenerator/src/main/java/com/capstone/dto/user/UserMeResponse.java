package com.capstone.dto.user;

import java.time.LocalDateTime;

public class UserMeResponse {
    private Integer userId;
    private String username;
    private String email;
    private String role;
    private Boolean active;
    private LocalDateTime createdAt;

    public UserMeResponse(Integer userId, String username, String email, String role, Boolean active, LocalDateTime createdAt) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.active = active;
        this.createdAt = createdAt;
    }

    public Integer getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Boolean getActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}