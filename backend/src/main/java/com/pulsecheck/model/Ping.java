package com.pulsecheck.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "monitor_id")
    private Monitor monitor;

    @Column(nullable = false)
    private String status;

    @Column(name = "response_time_ms")
    private Long responseTimeMs;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "checked_at")
    private LocalDateTime checkedAt;
    
    @PrePersist
    protected void onCreate() {
        if (checkedAt == null) {
            checkedAt = LocalDateTime.now();
        }
    }
}
