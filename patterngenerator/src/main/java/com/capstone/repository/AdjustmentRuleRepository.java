package com.capstone.repository;

import com.capstone.model.AdjustmentRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdjustmentRuleRepository extends JpaRepository<AdjustmentRule, Long> {
    List<AdjustmentRule> findByBasePatternId(Long basePatternId);
}