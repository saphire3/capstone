package com.capstone.service;

import com.capstone.dto.measurement.SaveUserMeasurementRequest;
import com.capstone.dto.measurement.UserMeasurementResponse;
import com.capstone.model.MeasurementDefinition;
import com.capstone.model.User;
import com.capstone.model.UserMeasurement;
import com.capstone.repository.MeasurementDefinitionRepository;
import com.capstone.repository.UserMeasurementRepository;
import com.capstone.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserMeasurementService {

    private final UserRepository userRepository;
    private final MeasurementDefinitionRepository measurementDefinitionRepository;
    private final UserMeasurementRepository userMeasurementRepository;

    public UserMeasurementResponse saveMeasurement(Authentication authentication,
                                                   SaveUserMeasurementRequest request) {
        String username = authentication.getName();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        MeasurementDefinition definition = measurementDefinitionRepository.findByCode(request.getCode())
                .orElseThrow(() -> new EntityNotFoundException("Measurement definition not found: " + request.getCode()));

        UserMeasurement userMeasurement = userMeasurementRepository
                .findByUserIdAndMeasurementDefinition_Code(user.getId(), request.getCode())
                .map(existing -> {
                    existing.setValue(request.getValue());
                    return existing;
                })
                .orElseGet(() -> UserMeasurement.builder()
                        .user(user)
                        .measurementDefinition(definition)
                        .value(request.getValue())
                        .build());

        UserMeasurement saved = userMeasurementRepository.save(userMeasurement);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<UserMeasurementResponse> getMyMeasurements(Authentication authentication) {
        String username = authentication.getName();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return userMeasurementRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private UserMeasurementResponse mapToResponse(UserMeasurement measurement) {
        return UserMeasurementResponse.builder()
                .id(measurement.getId())
                .code(measurement.getMeasurementDefinition().getCode())
                .displayName(measurement.getMeasurementDefinition().getDisplayName())
                .unit(measurement.getMeasurementDefinition().getUnit())
                .value(measurement.getValue())
                .build();
    }
}