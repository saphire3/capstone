package com.capstone.dto.pattern;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelectPatternRequest {

    @NotNull
    private Long basePatternId;
}