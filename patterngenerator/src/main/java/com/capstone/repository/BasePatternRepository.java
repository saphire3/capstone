package com.capstone.repository;

import com.capstone.model.BasePattern;
import com.capstone.model.PatternCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BasePatternRepository extends JpaRepository<BasePattern, Long> {
    List<BasePattern> findByCategory(PatternCategory category);
}