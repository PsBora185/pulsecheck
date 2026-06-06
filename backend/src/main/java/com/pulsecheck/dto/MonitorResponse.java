package com.pulsecheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MonitorResponse(
    Long id,
    String url,
    String name,
    @JsonProperty("isUp") boolean isUp,
    Long latency,
    Long ts
) {}

