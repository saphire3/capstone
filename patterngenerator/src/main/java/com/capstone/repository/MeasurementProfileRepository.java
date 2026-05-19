package com.capstone.repository;

import com.capstone.model.MeasurementProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeasurementProfileRepository extends JpaRepository<MeasurementProfile, Long> {
    List<MeasurementProfile> findByUserId(Long userId);
    Optional<MeasurementProfile> findByIdAndUserId(Long id, Long userId);
}