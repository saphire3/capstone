package com.capstone.dto.user;

import com.capstone.model.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String username;
    private String email;
    private String password;
    private Role role;
    private Boolean enabled;
}