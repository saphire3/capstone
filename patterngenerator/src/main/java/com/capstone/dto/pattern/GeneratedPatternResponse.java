package com.capstone.dto.pattern;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedPatternResponse {

    private Long basePatternId;
    private String patternName;
    private String category;
    private String description;
    private String originalGeometryJson;
    private String adjustedGeometryJson;
    private List<AppliedAdjustmentResponse> appliedAdjustments;
    private List<PieceMeasurementResponse> pieceMeasurements;
}