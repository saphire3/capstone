package com.capstone.dto.user;

import com.capstone.model.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserMeResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
}