package com.capstone.config;

import com.capstone.model.Role;
import com.capstone.model.User;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.existsByUsernameIgnoreCase(adminUsername)) {
            userRepository.findByUsernameIgnoreCase(adminUsername).ifPresent(existing -> {
                existing.setPassword(adminPassword);
                userRepository.save(existing);
                System.out.println("Admin password updated to plain text: " + adminUsername);
            });
            return;
        }

        User admin = User.builder()
                .username(adminUsername.trim())
                .email(adminEmail.trim().toLowerCase())
                .password(adminPassword)
                .role(Role.ADMIN)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        userRepository.save(admin);
        System.out.println("Admin created: " + adminUsername);
    }
}