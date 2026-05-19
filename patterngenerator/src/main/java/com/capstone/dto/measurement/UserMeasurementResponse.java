package com.capstone.dto.measurement;

import com.capstone.model.MeasurementCode;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMeasurementResponse {

    private Long id;
    private MeasurementCode code;
    private String displayName;
    private String unit;
    private Double value;
}