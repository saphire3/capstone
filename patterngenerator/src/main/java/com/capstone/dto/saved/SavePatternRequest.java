package com.capstone.dto.saved;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavePatternRequest {

    private String patternName;
    private String category;
    private Long basePatternId;
    private String adjustedGeometryJson;
    private String pieceMeasurementsJson;
    private String measurementsSnapshot;
}