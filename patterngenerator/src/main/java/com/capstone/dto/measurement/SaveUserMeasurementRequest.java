package com.capstone.dto.measurement;

import com.capstone.model.MeasurementCode;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveUserMeasurementRequest {

    @NotNull
    private MeasurementCode code;

    @NotNull
    private Double value;
}