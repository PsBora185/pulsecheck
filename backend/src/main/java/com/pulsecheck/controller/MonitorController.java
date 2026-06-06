package com.pulsecheck.controller;

import com.pulsecheck.dto.MonitorRequest;
import com.pulsecheck.dto.MonitorResponse;
import com.pulsecheck.dto.StatusResponse;
import com.pulsecheck.service.MonitorService;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class MonitorController {

    private final MonitorService monitorService;

    @PostMapping("/monitor")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> createMonitor(
            @Valid @RequestBody MonitorRequest request,
            org.springframework.security.core.Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        log.info("REST request to create monitor: {} for user: {}", request.url(), userDetails.getUsername());
        monitorService.saveMonitor(request, userDetails.getId());
        return Map.of("message", "Successfully deployed target!");
    }

    @GetMapping("/status")
    public List<MonitorResponse> getAllStatus(org.springframework.security.core.Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        log.info("REST request to get all monitor statuses for user: {}", userDetails.getUsername());
        return monitorService.getAllMonitors(userDetails.getId());
    }

    @GetMapping("/status/{url}")
    public StatusResponse getStatus(@PathVariable String url) {
        log.info("REST request to get status for URL: {}", url);
        return monitorService.getStatus(url);
    }

    @GetMapping("/monitor/{id}/history")
    public List<com.pulsecheck.dto.HistoryResponse> getHistory(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "24h") String range,
            org.springframework.security.core.Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        log.info("REST request to get history for monitor ID: {}, range: {} for user: {}", id, range, userDetails.getUsername());
        return monitorService.getMonitorHistory(id, range, userDetails.getId());
    }

    @GetMapping("/monitor/{id}/incidents")
    public List<com.pulsecheck.dto.IncidentResponse> getIncidents(
            @PathVariable Long id,
            org.springframework.security.core.Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        log.info("REST request to get incidents for monitor ID: {} for user: {}", id, userDetails.getUsername());
        return monitorService.getMonitorIncidents(id, userDetails.getId());
    }

    @DeleteMapping("/monitor/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMonitor(
            @PathVariable Long id,
            org.springframework.security.core.Authentication authentication) {
        com.pulsecheck.security.CustomUserDetails userDetails = (com.pulsecheck.security.CustomUserDetails) authentication.getPrincipal();
        log.info("REST request to delete monitor ID: {} for user: {}", id, userDetails.getUsername());
        monitorService.deactivateMonitor(id, userDetails.getId());
    }
}
