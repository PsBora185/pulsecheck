package com.pulsecheck.dto;

import java.time.LocalDateTime;

public record IncidentResponse(
    LocalDateTime startedAt,
    Long duration,
    String reason
) {}
