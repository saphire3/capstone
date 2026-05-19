package com.capstone.dto.profile;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class MeasurementProfileResponse {
    private Long id;
    private String profileName;
    private Map<String, Double> measurements;
    private LocalDateTime createdAt;
}