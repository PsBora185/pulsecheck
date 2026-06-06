package com.pulsecheck.repository;

import com.pulsecheck.model.Monitor;
import com.pulsecheck.model.Ping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PingRepository extends JpaRepository<Ping, Long> {
    Optional<Ping> findTop1ByMonitorOrderByCheckedAtDesc(Monitor monitor);
    List<Ping> findByMonitorAndCheckedAtAfter(Monitor monitor, LocalDateTime after);
    List<Ping> findByMonitorIdAndCheckedAtAfterOrderByCheckedAtAsc(Long monitorId, LocalDateTime after);
    List<Ping> findByMonitorIdOrderByCheckedAtAsc(Long monitorId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByMonitorId(Long monitorId);
}
