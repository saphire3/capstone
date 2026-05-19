package com.capstone.controller;

import com.capstone.dto.measurement.SaveUserMeasurementRequest;
import com.capstone.dto.measurement.UserMeasurementResponse;
import com.capstone.service.UserMeasurementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/measurements")
@RequiredArgsConstructor
public class UserMeasurementController {

    private final UserMeasurementService userMeasurementService;

    @PostMapping
    public UserMeasurementResponse saveMeasurement(Authentication authentication,
                                                   @Valid @RequestBody SaveUserMeasurementRequest request) {
        return userMeasurementService.saveMeasurement(authentication, request);
    }

    @GetMapping("/me")
    public List<UserMeasurementResponse> getMyMeasurements(Authentication authentication) {
        return userMeasurementService.getMyMeasurements(authentication);
    }
}