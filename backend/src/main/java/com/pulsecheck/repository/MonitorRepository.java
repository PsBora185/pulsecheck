package com.pulsecheck.repository;

import com.pulsecheck.model.Monitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonitorRepository extends JpaRepository<Monitor, Long> {
    Optional<Monitor> findByUrl(String url);
    List<Monitor> findByIsActiveTrue();
    List<Monitor> findByUserId(Long userId);
}
