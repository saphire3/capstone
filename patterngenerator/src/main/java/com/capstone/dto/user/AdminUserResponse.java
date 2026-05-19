package com.capstone.dto.user;

import com.capstone.model.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private boolean enabled;
    private LocalDateTime createdAt;
}