package com.capstone.repository;

import com.capstone.model.MeasurementCode;
import com.capstone.model.MeasurementDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MeasurementDefinitionRepository extends JpaRepository<MeasurementDefinition, Long> {
    Optional<MeasurementDefinition> findByCode(MeasurementCode code);
}