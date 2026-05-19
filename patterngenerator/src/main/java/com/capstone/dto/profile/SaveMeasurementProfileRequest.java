package com.capstone.dto.profile;

import lombok.Data;

import java.util.Map;

@Data
public class SaveMeasurementProfileRequest {
    private String profileName;
    private Map<String, Double> measurements;
}