package com.pulsecheck.dto;

public record StatusResponse(
    String url,
    String status,
    Long responseTimeMs,
    Long checkedAt
) {}

