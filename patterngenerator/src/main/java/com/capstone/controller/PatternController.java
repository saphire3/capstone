package com.capstone.controller;

import com.capstone.dto.pattern.BasePatternResponse;
import com.capstone.dto.pattern.GeneratedPatternResponse;
import com.capstone.dto.pattern.SelectPatternRequest;
import com.capstone.dto.pattern.UserPatternSelectionResponse;
import com.capstone.service.PatternService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patterns")
@RequiredArgsConstructor
public class PatternController {

    private final PatternService patternService;

    @GetMapping
    public List<BasePatternResponse> getAllPatterns() {
        return patternService.getAllPatterns();
    }

    @PostMapping("/select")
    public UserPatternSelectionResponse selectPattern(Authentication authentication,
                                                      @Valid @RequestBody SelectPatternRequest request) {
        return patternService.selectPattern(authentication, request);
    }

    @GetMapping("/my-selection")
    public UserPatternSelectionResponse getMySelection(Authentication authentication) {
        return patternService.getMySelection(authentication);
    }

    @GetMapping("/generate")
    public GeneratedPatternResponse generateMyPattern(Authentication authentication,
                                                       @RequestParam(required = false) Long profileId) {
        return patternService.generateMyPattern(authentication, profileId);
    }

    @PostMapping("/{id}/use")
    public BasePatternResponse trackUse(@PathVariable Long id) {
        return patternService.trackUse(id);
    }
}