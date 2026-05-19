package com.capstone.dto.pattern;

import com.capstone.model.PatternCategory;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatternResponse {
    private Long id;
    private String patternName;
    private PatternCategory category;
    private Double baseChest;
    private Double baseShoulderWidth;
    private Double baseShirtLength;
    private Double baseSleeveLength;
    private String geometryJson;
}