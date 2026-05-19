package com.capstone.dto.pattern;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PieceMeasurementResponse {

    private String pieceName;
    private Double totalLength;
    private List<EdgeMeasurementResponse> edges;
}