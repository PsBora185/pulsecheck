package com.pulsecheck.dto;

public record AuthResponse(
    String token,
    String email,
    String displayName
) {}
