package com.pulsecheck.scheduler;

import com.pulsecheck.model.Monitor;
import com.pulsecheck.repository.MonitorRepository;
import com.pulsecheck.service.PingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PingScheduler {

    private final MonitorRepository monitorRepository;
    private final PingService pingService;

    @Scheduled(fixedDelay = 10000)
    public void schedulePings() {
        List<Monitor> activeMonitors = monitorRepository.findByIsActiveTrue();
        for (Monitor monitor : activeMonitors) {
            long start = System.currentTimeMillis();
            pingService.ping(monitor);
            long elapsed = System.currentTimeMillis() - start;
            log.info("Pinged {} — in {}ms", monitor.getUrl(), elapsed);
        }
    }
}
/*
  KAFKA UPGRADE PATH (when you outgrow @Scheduled):
  - Replace PingScheduler with a KafkaProducer that publishes MonitorEvent to topic "ping-requests"
  - Add a KafkaConsumer @KafkaListener in PingService that processes ping-requests
  - Benefit: multiple worker instances can consume from the same topic, horizontal scaling
  - Add spring-kafka to pom.xml and configure bootstrap-servers in application.yml
  - AWS Free Tier: use Amazon MSK Serverless or run Kafka in Docker on the same EC2
*/
