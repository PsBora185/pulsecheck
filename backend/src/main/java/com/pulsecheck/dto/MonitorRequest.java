package com.pulsecheck.dto;

import jakarta.validation.constraints.NotBlank;

public record MonitorRequest(
    @NotBlank(message = "URL is required") String url,
    Integer interval
) {}

