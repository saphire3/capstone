package com.capstone.dto.pattern;

import com.capstone.model.PatternCategory;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BasePatternResponse {

    private Long id;
    private String patternName;
    private PatternCategory category;
    private Double baseChest;
    private Double baseShoulderWidth;
    private Double baseShirtLength;
    private Double baseSleeveLength;
    private String description;
    private Double baseWaist;
    private Double baseHip;
    private Double baseOutseam;
    private Double baseNeck;
    private Double baseArmholeDepth;
    private Double baseBicep;
    private String geometryJson;
    private Long useCount;
}