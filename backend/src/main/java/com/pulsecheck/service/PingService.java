package com.pulsecheck.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulsecheck.dto.StatusResponse;
import com.pulsecheck.model.Monitor;
import com.pulsecheck.model.Ping;
import com.pulsecheck.repository.PingRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PingService {

    private final PingRepository pingRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final MeterRegistry meterRegistry;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String LATEST_STATUS_KEY = "latest_status";

    public void ping(Monitor monitor) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(10000);
        RestTemplate restTemplate = new RestTemplate(factory);

        long start = System.currentTimeMillis();
        String status = "DOWN";
        String failureReason = null;
        Long responseTimeMs = null;

        try {
            org.springframework.http.ResponseEntity<String> response = restTemplate.getForEntity(monitor.getUrl(), String.class);
            responseTimeMs = System.currentTimeMillis() - start;
            if (response.getStatusCode().is2xxSuccessful()) {
                status = "UP";
            } else if (response.getStatusCode().is4xxClientError()) {
                failureReason = "HTTP_4XX";
            } else if (response.getStatusCode().is5xxServerError()) {
                failureReason = "HTTP_5XX";
            } else {
                failureReason = "NON_2XX";
            }
        } catch (RestClientException e) {
            responseTimeMs = System.currentTimeMillis() - start;
            if (e.getMessage() != null) {
                if (e.getMessage().contains("timed out")) {
                    failureReason = "TIMEOUT";
                } else if (e.getMessage().contains("Connection refused")) {
                    failureReason = "CONNECTION_REFUSED";
                } else if (e.getMessage().contains("SSL")) {
                    failureReason = "SSL_ERROR";
                } else if (e.getMessage().contains("UnknownHostException")) {
                    failureReason = "DNS_ERROR";
                } else {
                    failureReason = "CONNECTION_ERROR";
                }
            } else {
                failureReason = "UNKNOWN_ERROR";
            }
        }

        if (!"UP".equals(status)) {
            responseTimeMs = null;
        }

        // Save to DB
        Ping ping = new Ping();
        ping.setMonitor(monitor);
        ping.setStatus(status);
        ping.setResponseTimeMs(responseTimeMs);
        ping.setFailureReason(failureReason);
        pingRepository.save(ping);

        // Update Redis
        try {
            StatusResponse statusResponse = new StatusResponse(
                monitor.getUrl(), status, responseTimeMs, System.currentTimeMillis()
            );
            String json = objectMapper.writeValueAsString(statusResponse);
            redisTemplate.opsForHash().put(LATEST_STATUS_KEY, monitor.getUrl(), json);
        } catch (Exception e) {
            // Ignore JSON serialization errors
        }

        // Increment Micrometer counter
        meterRegistry.counter("pulsecheck.checks.total", "status", status.toLowerCase()).increment();
    }
}
