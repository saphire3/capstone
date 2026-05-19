package com.capstone.controller;

import com.capstone.dto.pattern.BasePatternResponse;
import com.capstone.dto.pattern.CreateBasePatternRequest;
import com.capstone.dto.pattern.UpdateBasePatternRequest;
import com.capstone.service.PatternService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/patterns")
@RequiredArgsConstructor
public class AdminPatternController {

    private final PatternService patternService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BasePatternResponse create(@Valid @RequestBody CreateBasePatternRequest request) {
        return patternService.createPattern(request);
    }

    @PutMapping("/{id}")
    public BasePatternResponse update(@PathVariable Long id,
                                      @Valid @RequestBody UpdateBasePatternRequest request) {
        return patternService.updatePattern(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        patternService.deletePattern(id);
    }
}