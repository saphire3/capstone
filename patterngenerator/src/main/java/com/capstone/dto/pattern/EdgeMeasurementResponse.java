package com.capstone.dto.pattern;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EdgeMeasurementResponse {

    private String label;
    private String type;
    private String fromPoint;
    private String toPoint;
    private Double length;
}