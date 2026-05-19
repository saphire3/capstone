package com.capstone.dto.pattern;

import com.capstone.model.PatternCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBasePatternRequest {

    @NotBlank
    private String patternName;

    @NotNull
    private PatternCategory category;

    private Double baseChest;
    private Double baseShoulderWidth;
    private Double baseShirtLength;
    private Double baseSleeveLength;
    private Double baseWaist;
    private Double baseHip;
    private Double baseOutseam;
    private Double baseNeck;
    private Double baseArmholeDepth;
    private Double baseBicep;

    private String description;

    @NotBlank
    private String geometryJson;
}