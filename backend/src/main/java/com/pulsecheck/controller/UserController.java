package com.pulsecheck.controller;

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
public class UserController {

    private final UserService userService;

    @PatchMapping("/profile")
    public AuthResponse updateProfile(@Valid @RequestBody ProfileRequest request, Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        return userService.updateProfile(request, userDetails.getId());
    }

    @PatchMapping("/password")
    public void updatePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        userService.updatePassword(request, userDetails.getId());
    }

    @DeleteMapping("/account")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        userService.deleteAccount(userDetails.getId());
    }
}
