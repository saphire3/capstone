package com.capstone.controller;

import com.capstone.dto.user.UserMeResponse;
import com.capstone.model.User;
import com.capstone.repository.UserRepository;
import com.capstone.service.TokenService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final TokenService tokenService;
    private final UserRepository userRepository;

    public UserController(TokenService tokenService, UserRepository userRepository) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public UserMeResponse me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Unauthorized");
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Integer userId = tokenService.getUserIdFromToken(token);
        if (userId == null) throw new IllegalArgumentException("Unauthorized");

        User u = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Unauthorized"));
        return new UserMeResponse(u.getUserId(), u.getUsername(), u.getEmail(), u.getRole(), u.getActive(), u.getCreatedAt());
    }
}