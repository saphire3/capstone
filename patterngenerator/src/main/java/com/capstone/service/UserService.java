package com.capstone.service;

import com.capstone.dto.user.UserMeResponse;
import com.capstone.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    public UserMeResponse toMeResponse(User user) {
        return UserMeResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}