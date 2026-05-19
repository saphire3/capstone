package com.capstone.dto.user;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private Boolean active;
    private LocalDateTime createdAt;
}