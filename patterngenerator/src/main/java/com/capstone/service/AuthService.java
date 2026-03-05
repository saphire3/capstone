package com.capstone.service;

import com.capstone.dto.auth.AuthResponse;
import com.capstone.dto.auth.LoginRequest;
import com.capstone.dto.auth.SignupRequest;
import com.capstone.model.User;
import com.capstone.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, TokenService tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }

    public AuthResponse signup(SignupRequest req) {
        if (req.getUsername() == null || req.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (userRepository.existsByUsernameIgnoreCase(req.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User u = new User();
        u.setUsername(req.getUsername().trim());
        u.setEmail(req.getEmail().trim());
        u.setPasswordHash(encoder.encode(req.getPassword()));
        u.setRole("USER"); // admins can't sign up
        u.setActive(true);

        User saved = userRepository.save(u);
        String token = tokenService.issueToken(saved.getUserId());
        return new AuthResponse(token, saved.getUserId(), saved.getUsername(), saved.getEmail(), saved.getRole());
    }

    public AuthResponse login(LoginRequest req) {
        if (req.getLogin() == null || req.getLogin().isBlank()) {
            throw new IllegalArgumentException("Login is required");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User u = userRepository
                .findByUsernameIgnoreCaseOrEmailIgnoreCase(req.getLogin().trim(), req.getLogin().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!Boolean.TRUE.equals(u.getActive())) {
            throw new IllegalArgumentException("Account is inactive");
        }
        if (!encoder.matches(req.getPassword(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = tokenService.issueToken(u.getUserId());
        return new AuthResponse(token, u.getUserId(), u.getUsername(), u.getEmail(), u.getRole());
    }
}