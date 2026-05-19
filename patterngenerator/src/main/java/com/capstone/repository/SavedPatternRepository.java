package com.capstone.repository;

import com.capstone.model.SavedPattern;
import com.capstone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedPatternRepository extends JpaRepository<SavedPattern, Long> {

    List<SavedPattern> findByUserOrderByCreatedAtDesc(User user);

    Optional<SavedPattern> findByIdAndUser(Long id, User user);
}