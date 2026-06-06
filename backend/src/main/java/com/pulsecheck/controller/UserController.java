package com.pulsecheck.controller;

import lombok.extern.slf4j.Slf4j;
import com.pulsecheck.dto.AuthResponse;
import com.pulsecheck.dto.ChangePasswordRequest;
import com.pulsecheck.dto.ProfileRequest;
import com.pulsecheck.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @PatchMapping("/profile")
    public AuthResponse updateProfile(@Valid @RequestBody ProfileRequest request, Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        log.info("REST request to update profile for user ID: {} ({})", userDetails.getId(), userDetails.getUsername());
        return userService.updateProfile(request, userDetails.getId());
    }

    @PatchMapping("/password")
    public void updatePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        log.info("REST request to change password for user ID: {} ({})", userDetails.getId(), userDetails.getUsername());
        userService.updatePassword(request, userDetails.getId());
    }

    @DeleteMapping("/account")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        log.info("REST request to delete account for user ID: {} ({})", userDetails.getId(), userDetails.getUsername());
        userService.deleteAccount(userDetails.getId());
    }
}
