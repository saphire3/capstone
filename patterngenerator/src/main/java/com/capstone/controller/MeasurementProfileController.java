package com.capstone.controller;

import com.capstone.dto.profile.MeasurementProfileResponse;
import com.capstone.dto.profile.SaveMeasurementProfileRequest;
import com.capstone.service.MeasurementProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class MeasurementProfileController {

    private final MeasurementProfileService profileService;

    @GetMapping
    public List<MeasurementProfileResponse> getMyProfiles(Authentication authentication) {
        return profileService.getMyProfiles(authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MeasurementProfileResponse createProfile(Authentication authentication,
                                                     @RequestBody SaveMeasurementProfileRequest request) {
        return profileService.saveProfile(authentication, request);
    }

    @PutMapping("/{id}")
    public MeasurementProfileResponse updateProfile(Authentication authentication,
                                                      @PathVariable Long id,
                                                      @RequestBody SaveMeasurementProfileRequest request) {
        return profileService.updateProfile(authentication, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProfile(Authentication authentication, @PathVariable Long id) {
        profileService.deleteProfile(authentication, id);
    }
}