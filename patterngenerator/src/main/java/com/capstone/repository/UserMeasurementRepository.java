package com.capstone.repository;

import com.capstone.model.MeasurementCode;
import com.capstone.model.UserMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserMeasurementRepository extends JpaRepository<UserMeasurement, Long> {

    List<UserMeasurement> findByUserId(Long userId);

    Optional<UserMeasurement> findByUserIdAndMeasurementDefinition_Code(Long userId, MeasurementCode code);

    boolean existsByUserIdAndMeasurementDefinition_Id(Long userId, Long measurementDefinitionId);
}