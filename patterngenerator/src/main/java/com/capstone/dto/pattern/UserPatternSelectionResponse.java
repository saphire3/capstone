package com.capstone.dto.pattern;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPatternSelectionResponse {

    private Long selectionId;
    private Long basePatternId;
    private String patternName;
    private String category;
    private String description;
}