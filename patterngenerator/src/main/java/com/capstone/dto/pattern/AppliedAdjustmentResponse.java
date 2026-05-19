package com.capstone.dto.pattern;

import com.capstone.model.Axis;
import com.capstone.model.MeasurementCode;
import com.capstone.model.PatternPointTargetType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppliedAdjustmentResponse {

    private String pieceName;
    private PatternPointTargetType targetType;
    private String targetName;
    private MeasurementCode measurementCode;
    private Axis axis;
    private Double measurementValue;
    private Double ratio;
    private Double adjustmentAmount;
}