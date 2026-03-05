package com.capstone.repository;

import com.capstone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    // Find by username
    Optional<User> findByUsernameIgnoreCase(String username);

    // Find by email
    Optional<User> findByEmailIgnoreCase(String email);

    // Login with either username OR email (we pass the same "login" value twice)
    Optional<User> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);

    // Uniqueness checks for signup
    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);
}