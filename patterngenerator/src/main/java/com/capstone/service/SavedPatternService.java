package com.capstone.service;

import com.capstone.dto.saved.SavePatternRequest;
import com.capstone.dto.saved.SavedPatternResponse;
import com.capstone.model.PatternCategory;
import com.capstone.model.SavedPattern;
import com.capstone.model.User;
import com.capstone.repository.SavedPatternRepository;
import com.capstone.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SavedPatternService {

    private final SavedPatternRepository savedPatternRepository;
    private final UserRepository userRepository;

    public SavedPatternResponse save(Authentication authentication, SavePatternRequest request) {
        User user = resolveUser(authentication);
        PatternCategory category;
        try {
            category = PatternCategory.valueOf(request.getCategory());
        } catch (Exception e) {
            category = PatternCategory.TOPS;
        }
        SavedPattern saved = SavedPattern.builder()
                .user(user)
                .patternName(request.getPatternName())
                .category(category)
                .basePatternId(request.getBasePatternId())
                .adjustedGeometryJson(request.getAdjustedGeometryJson())
                .pieceMeasurementsJson(request.getPieceMeasurementsJson())
                .measurementsSnapshot(request.getMeasurementsSnapshot())
                .build();
        return toResponse(savedPatternRepository.save(saved));
    }

    @Transactional(readOnly = true)
    public List<SavedPatternResponse> listForUser(Authentication authentication) {
        User user = resolveUser(authentication);
        return savedPatternRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void delete(Authentication authentication, Long id) {
        User user = resolveUser(authentication);
        SavedPattern sp = savedPatternRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new EntityNotFoundException("Saved pattern not found"));
        savedPatternRepository.delete(sp);
    }

    private User resolveUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private SavedPatternResponse toResponse(SavedPattern sp) {
        return SavedPatternResponse.builder()
                .id(sp.getId())
                .patternName(sp.getPatternName())
                .category(sp.getCategory() != null ? sp.getCategory().name() : null)
                .basePatternId(sp.getBasePatternId())
                .adjustedGeometryJson(sp.getAdjustedGeometryJson())
                .pieceMeasurementsJson(sp.getPieceMeasurementsJson())
                .measurementsSnapshot(sp.getMeasurementsSnapshot())
                .createdAt(sp.getCreatedAt())
                .build();
    }
}