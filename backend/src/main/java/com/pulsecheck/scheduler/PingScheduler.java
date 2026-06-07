package com.pulsecheck.scheduler;

import com.pulsecheck.model.Monitor;
import com.pulsecheck.repository.MonitorRepository;
import com.pulsecheck.service.PingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;

import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class PingScheduler {

    private final MonitorRepository monitorRepository;
    private final PingService pingService;
    private final ThreadPoolTaskScheduler taskScheduler;

    private final Map<Long, ScheduledTaskInfo> scheduledTasks = new ConcurrentHashMap<>();

    private record ScheduledTaskInfo(ScheduledFuture<?> future, int intervalSeconds, String url) {}

    @Scheduled(fixedDelay = 5000) // Sync active monitor schedules every 5 seconds
    public synchronized void syncPings() {
        try {
            List<Monitor> activeMonitors = monitorRepository.findByIsActiveTrue();
            Set<Long> activeMonitorIds = activeMonitors.stream().map(Monitor::getId).collect(Collectors.toSet());

            // 1. Cancel and remove tasks for monitors that are no longer active or present
            scheduledTasks.entrySet().removeIf(entry -> {
                Long id = entry.getKey();
                if (!activeMonitorIds.contains(id)) {
                    log.info("Cancelling task for monitor ID: {} ({}) - no longer active/present", id, entry.getValue().url());
                    entry.getValue().future().cancel(true);
                    return true;
                }
                return false;
            });

            // 2. Schedule new or rescheduled tasks
            for (Monitor monitor : activeMonitors) {
                Long monitorId = monitor.getId();
                int interval = monitor.getIntervalSeconds() != null && monitor.getIntervalSeconds() > 0 
                        ? monitor.getIntervalSeconds() 
                        : 10;

                ScheduledTaskInfo existing = scheduledTasks.get(monitorId);

                if (existing == null) {
                    log.info("Scheduling new parallel task for monitor ID: {} ({}) with interval {}s", monitorId, monitor.getUrl(), interval);
                    ScheduledFuture<?> future = taskScheduler.scheduleWithFixedDelay(
                            () -> executePing(monitorId), 
                            Duration.ofSeconds(interval)
                    );
                    scheduledTasks.put(monitorId, new ScheduledTaskInfo(future, interval, monitor.getUrl()));
                } else if (existing.intervalSeconds() != interval) {
                    log.info("Rescheduling task for monitor ID: {} ({}) due to interval change ({}s -> {}s)", monitorId, monitor.getUrl(), existing.intervalSeconds(), interval);
                    existing.future().cancel(true);

                    ScheduledFuture<?> future = taskScheduler.scheduleWithFixedDelay(
                            () -> executePing(monitorId), 
                            Duration.ofSeconds(interval)
                    );
                    scheduledTasks.put(monitorId, new ScheduledTaskInfo(future, interval, monitor.getUrl()));
                }
            }
        } catch (Exception e) {
            log.error("Error syncing parallel ping schedules: {}", e.getMessage(), e);
        }
    }

    private void executePing(Long monitorId) {
        try {
            monitorRepository.findById(monitorId).ifPresent(monitor -> {
                if (monitor.getIsActive()) {
                    long start = System.currentTimeMillis();
                    pingService.ping(monitor);
                    long elapsed = System.currentTimeMillis() - start;
                    log.info("Pinged {} — in {}ms", monitor.getUrl(), elapsed);
                }
            });
        } catch (Exception e) {
            log.error("Error executing ping for monitor ID {}: {}", monitorId, e.getMessage());
        }
    }

    @PreDestroy
    public void cleanup() {
        log.info("Cleaning up all scheduled ping tasks during shutdown...");
        scheduledTasks.values().forEach(task -> task.future().cancel(true));
        scheduledTasks.clear();
    }
}
