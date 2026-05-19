package com.capstone.service;

import com.capstone.dto.profile.MeasurementProfileResponse;
import com.capstone.dto.profile.SaveMeasurementProfileRequest;
import com.capstone.model.MeasurementProfile;
import com.capstone.model.User;
import com.capstone.repository.MeasurementProfileRepository;
import com.capstone.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class MeasurementProfileService {

    private final MeasurementProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public MeasurementProfileResponse saveProfile(Authentication authentication,
                                                   SaveMeasurementProfileRequest request) {
        User user = getUser(authentication);

        String json;
        try {
            json = objectMapper.writeValueAsString(request.getMeasurements());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid measurements");
        }

        MeasurementProfile profile = MeasurementProfile.builder()
                .user(user)
                .profileName(request.getProfileName())
                .measurementsJson(json)
                .build();

        return mapToResponse(profileRepository.save(profile));
    }

    public MeasurementProfileResponse updateProfile(Authentication authentication,
                                                      Long profileId,
                                                      SaveMeasurementProfileRequest request) {
        User user = getUser(authentication);

        MeasurementProfile profile = profileRepository.findByIdAndUserId(profileId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Profile not found"));

        profile.setProfileName(request.getProfileName());
        try {
            profile.setMeasurementsJson(objectMapper.writeValueAsString(request.getMeasurements()));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid measurements");
        }

        return mapToResponse(profileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public List<MeasurementProfileResponse> getMyProfiles(Authentication authentication) {
        User user = getUser(authentication);
        return profileRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void deleteProfile(Authentication authentication, Long profileId) {
        User user = getUser(authentication);
        MeasurementProfile profile = profileRepository.findByIdAndUserId(profileId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Profile not found"));
        profileRepository.delete(profile);
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getProfileMeasurements(Long profileId, Long userId) {
        MeasurementProfile profile = profileRepository.findByIdAndUserId(profileId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found"));
        try {
            return objectMapper.readValue(profile.getMeasurementsJson(),
                    new TypeReference<Map<String, Double>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Could not read profile measurements");
        }
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private MeasurementProfileResponse mapToResponse(MeasurementProfile profile) {
        Map<String, Double> measurements;
        try {
            measurements = profile.getMeasurementsJson() != null
                    ? objectMapper.readValue(profile.getMeasurementsJson(),
                            new TypeReference<Map<String, Double>>() {})
                    : Map.of();
        } catch (Exception e) {
            measurements = Map.of();
        }
        return MeasurementProfileResponse.builder()
                .id(profile.getId())
                .profileName(profile.getProfileName())
                .measurements(measurements)
                .createdAt(profile.getCreatedAt())
                .build();
    }
}