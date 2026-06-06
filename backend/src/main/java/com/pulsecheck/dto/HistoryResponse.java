package com.pulsecheck.dto;

import java.time.LocalDateTime;

public record HistoryResponse(
    LocalDateTime checkedAt,
    Long responseTimeMs,
    String status
) {}
