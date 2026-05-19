package com.capstone.repository;

import com.capstone.model.UserPatternSelection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPatternSelectionRepository extends JpaRepository<UserPatternSelection, Long> {

    Optional<UserPatternSelection> findByUserId(Long userId);
}