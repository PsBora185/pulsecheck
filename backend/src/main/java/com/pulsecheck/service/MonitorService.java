package com.pulsecheck.service;

import com.pulsecheck.dto.MonitorRequest;
import com.pulsecheck.dto.MonitorResponse;
import com.pulsecheck.dto.StatusResponse;
import com.pulsecheck.model.Monitor;
import com.pulsecheck.model.User;
import com.pulsecheck.model.Ping;
import com.pulsecheck.repository.MonitorRepository;
import com.pulsecheck.repository.UserRepository;
import com.pulsecheck.repository.PingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MonitorService {

    private final MonitorRepository monitorRepository;
    private final UserRepository userRepository;
    private final PingRepository pingRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private static final String LATEST_STATUS_KEY = "latest_status";

    @CacheEvict(value = "active_monitors", key = "#userId")
    public MonitorResponse saveMonitor(MonitorRequest req, Long userId) {
        if (monitorRepository.findByUrl(req.url()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "URL already exists");
        }

        Monitor monitor = new Monitor();
        monitor.setUrl(req.url());
        
        if (req.interval() != null) {
            monitor.setIntervalSeconds(req.interval());
        }

        // Try to parse name from host
        if (req.name() != null && !req.name().isBlank()) {
            monitor.setName(req.name());
        } else {
            try {
                URI uri = URI.create(req.url());
                monitor.setName(uri.getHost() != null ? uri.getHost() : req.url());
            } catch (Exception e) {
                monitor.setName(req.url());
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        monitor.setUser(user);

        monitor = monitorRepository.save(monitor);

        return new MonitorResponse(
            monitor.getId(), monitor.getUrl(), monitor.getName(),
            false, null, null, monitor.getIsActive(), monitor.getIntervalSeconds()
        );
    }

    @Cacheable(value = "active_monitors", key = "#userId")
    public List<Monitor> getMonitorsFromDb(Long userId) {
        return monitorRepository.findByUserId(userId);
    }

    public List<MonitorResponse> getAllMonitors(Long userId) {
        return getMonitorsFromDb(userId).stream().map(monitor -> {
            StatusResponse status = getStatus(monitor.getUrl());
            boolean isUp = status != null && "UP".equals(status.status());
            Long latency = status != null ? status.responseTimeMs() : null;
            if (!isUp) {
                latency = null;
            }
            Long ts = status != null ? status.checkedAt() : System.currentTimeMillis();
            return new MonitorResponse(
                monitor.getId(),
                monitor.getUrl(),
                monitor.getName(),
                isUp,
                latency,
                ts,
                monitor.getIsActive(),
                monitor.getIntervalSeconds()
            );
        }).collect(Collectors.toList());
    }

    public StatusResponse getStatus(String url) {
        Object data = redisTemplate.opsForHash().get(LATEST_STATUS_KEY, url);
        if (data == null) return null;
        
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(data.toString(), StatusResponse.class);
        } catch (Exception e) {
            return null;
        }
    }

    @CacheEvict(value = "active_monitors", key = "#userId")
    @org.springframework.transaction.annotation.Transactional
    public void deleteMonitor(Long id, Long userId) {
        Monitor monitor = monitorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));

        if (!monitor.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        // Delete all associated pings first to avoid foreign key violation
        pingRepository.deleteByMonitorId(id);

        // Delete monitor
        monitorRepository.delete(monitor);

        // Remove from Redis status cache
        try {
            redisTemplate.opsForHash().delete(LATEST_STATUS_KEY, monitor.getUrl());
        } catch (Exception e) {
            // Ignore Redis errors
        }
    }

    @CacheEvict(value = "active_monitors", key = "#userId")
    public MonitorResponse updateMonitor(Long id, MonitorRequest req, Long userId) {
        Monitor monitor = monitorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));

        if (!monitor.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        // Check if URL is changed and already exists in other monitors
        if (!monitor.getUrl().equals(req.url())) {
            java.util.Optional<Monitor> existing = monitorRepository.findByUrl(req.url());
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "URL already exists");
            }
        }

        monitor.setUrl(req.url());
        if (req.name() != null && !req.name().isBlank()) {
            monitor.setName(req.name());
        } else {
            try {
                URI uri = URI.create(req.url());
                monitor.setName(uri.getHost() != null ? uri.getHost() : req.url());
            } catch (Exception e) {
                monitor.setName(req.url());
            }
        }

        if (req.interval() != null) {
            monitor.setIntervalSeconds(req.interval());
        }

        monitor = monitorRepository.save(monitor);

        StatusResponse status = getStatus(monitor.getUrl());
        boolean isUp = status != null && "UP".equals(status.status());
        Long latency = status != null ? status.responseTimeMs() : null;
        Long ts = status != null ? status.checkedAt() : System.currentTimeMillis();

        return new MonitorResponse(
            monitor.getId(),
            monitor.getUrl(),
            monitor.getName(),
            isUp,
            latency,
            ts,
            monitor.getIsActive(),
            monitor.getIntervalSeconds()
        );
    }

    @CacheEvict(value = "active_monitors", key = "#userId")
    public void toggleMonitor(Long id, Long userId) {
        Monitor monitor = monitorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));

        if (!monitor.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        monitor.setIsActive(!monitor.getIsActive());
        monitorRepository.save(monitor);
    }

    public List<com.pulsecheck.dto.HistoryResponse> getMonitorHistory(Long id, String range, Long userId) {
        Monitor monitor = monitorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));

        if (!monitor.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        java.time.LocalDateTime threshold;
        if ("7d".equalsIgnoreCase(range)) {
            threshold = java.time.LocalDateTime.now().minusDays(7);
        } else if ("30d".equalsIgnoreCase(range)) {
            threshold = java.time.LocalDateTime.now().minusDays(30);
        } else {
            threshold = java.time.LocalDateTime.now().minusHours(24);
        }

        return pingRepository.findByMonitorIdAndCheckedAtAfterOrderByCheckedAtAsc(id, threshold)
                .stream()
                .map(p -> new com.pulsecheck.dto.HistoryResponse(p.getCheckedAt(), p.getResponseTimeMs(), p.getStatus()))
                .collect(Collectors.toList());
    }

    public List<com.pulsecheck.dto.IncidentResponse> getMonitorIncidents(Long id, Long userId) {
        Monitor monitor = monitorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));

        if (!monitor.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        List<Ping> pings = pingRepository.findByMonitorIdOrderByCheckedAtAsc(id);
        List<com.pulsecheck.dto.IncidentResponse> incidents = new java.util.ArrayList<>();

        java.time.LocalDateTime currentStart = null;
        java.time.LocalDateTime currentEnd = null;
        String reason = null;

        for (Ping ping : pings) {
            if ("DOWN".equals(ping.getStatus())) {
                if (currentStart == null) {
                    currentStart = ping.getCheckedAt();
                    currentEnd = ping.getCheckedAt();
                    reason = ping.getFailureReason() != null ? ping.getFailureReason() : "UNKNOWN";
                } else {
                    currentEnd = ping.getCheckedAt();
                }
            } else if ("UP".equals(ping.getStatus())) {
                if (currentStart != null) {
                    long duration = java.time.Duration.between(currentStart, currentEnd).toSeconds();
                    if (duration == 0) {
                        duration = monitor.getIntervalSeconds() != null ? monitor.getIntervalSeconds() : 10;
                    }
                    incidents.add(new com.pulsecheck.dto.IncidentResponse(currentStart, duration, reason));
                    currentStart = null;
                    currentEnd = null;
                    reason = null;
                }
            }
        }

        if (currentStart != null) {
            long duration = java.time.Duration.between(currentStart, currentEnd).toSeconds();
            if (duration == 0) {
                duration = monitor.getIntervalSeconds() != null ? monitor.getIntervalSeconds() : 10;
            }
            incidents.add(new com.pulsecheck.dto.IncidentResponse(currentStart, duration, reason));
        }

        java.util.Collections.reverse(incidents);
        return incidents;
    }
}
