package com.capstone.controller;

import com.capstone.dto.saved.SavePatternRequest;
import com.capstone.dto.saved.SavedPatternResponse;
import com.capstone.service.SavedPatternService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-patterns")
@RequiredArgsConstructor
public class SavedPatternController {

    private final SavedPatternService savedPatternService;

    @PostMapping
    public SavedPatternResponse save(Authentication authentication,
                                     @RequestBody SavePatternRequest request) {
        return savedPatternService.save(authentication, request);
    }

    @GetMapping
    public List<SavedPatternResponse> list(Authentication authentication) {
        return savedPatternService.listForUser(authentication);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        savedPatternService.delete(authentication, id);
        return ResponseEntity.noContent().build();
    }
}