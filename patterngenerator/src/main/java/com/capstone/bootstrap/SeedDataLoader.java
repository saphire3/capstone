package com.capstone.bootstrap;

import com.capstone.model.User;
import com.capstone.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class SeedDataLoader {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public SeedDataLoader(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void seedAdmin() {
        userRepository.findByUsernameIgnoreCase("admin").ifPresentOrElse(
                u -> {},
                () -> {
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setEmail("admin@capstone.com");
                    admin.setPasswordHash(encoder.encode("admin123"));
                    admin.setRole("ADMIN");
                    admin.setActive(true);
                    userRepository.save(admin);
                }
        );
    }
}