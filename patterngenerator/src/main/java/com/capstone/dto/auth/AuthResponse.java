package com.capstone.dto.auth;

public class AuthResponse {
    private String token;
    private Integer userId;
    private String username;
    private String email;
    private String role;

    public AuthResponse(String token, Integer userId, String username, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public String getToken() { return token; }
    public Integer getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}