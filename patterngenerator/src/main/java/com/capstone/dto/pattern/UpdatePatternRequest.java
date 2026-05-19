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
public class UpdatePatternRequest {

    @NotBlank
    private String patternName;

    @NotNull
    private PatternCategory category;

    @NotNull
    private Double baseChest;

    @NotNull
    private Double baseShoulderWidth;

    @NotNull
    private Double baseShirtLength;

    @NotNull
    private Double baseSleeveLength;

    @NotBlank
    private String geometryJson;
}