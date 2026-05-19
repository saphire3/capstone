package com.capstone.dto.saved;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedPatternResponse {

    private Long id;
    private String patternName;
    private String category;
    private Long basePatternId;
    private String adjustedGeometryJson;
    private String pieceMeasurementsJson;
    private String measurementsSnapshot;
    private LocalDateTime createdAt;
}