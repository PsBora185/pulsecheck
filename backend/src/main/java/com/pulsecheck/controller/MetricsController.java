package com.pulsecheck.controller;

import org.springframework.web.bind.annotation.RestController;

@RestController
public class MetricsController {
    // Note: DO NOT manually implement /metrics. 
    // Spring Boot Actuator + Micrometer already exposes it at /actuator/prometheus.
    // TODO: The existing Prometheus scrape config will need to change from /metrics to /actuator/prometheus.
}
