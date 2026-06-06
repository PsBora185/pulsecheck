package com.pulsecheck.service;

import com.pulsecheck.config.JwtConfig;
import com.pulsecheck.dto.AuthResponse;
import com.pulsecheck.dto.ChangePasswordRequest;
import com.pulsecheck.dto.ProfileRequest;
import com.pulsecheck.model.Monitor;
import com.pulsecheck.model.User;
import com.pulsecheck.repository.MonitorRepository;
import com.pulsecheck.repository.PingRepository;
import com.pulsecheck.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MonitorRepository monitorRepository;
    private final PingRepository pingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;

    @Transactional
    public AuthResponse updateProfile(ProfileRequest req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getEmail().equalsIgnoreCase(req.email())) {
            Optional<User> existing = userRepository.findByEmail(req.email());
            if (existing.isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
            user.setEmail(req.email());
        }

        user.setDisplayName(req.displayName());
        user = userRepository.save(user);

        String token = jwtConfig.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getDisplayName());
    }

    @Transactional
    public void updatePassword(ChangePasswordRequest req, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid current password");
        }

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Cascade delete monitors and pings manually to prevent FK constraint violations
        List<Monitor> monitors = monitorRepository.findByUserId(userId);
        for (Monitor monitor : monitors) {
            pingRepository.deleteByMonitorId(monitor.getId());
        }
        monitorRepository.deleteAll(monitors);

        // Delete user
        userRepository.delete(user);
    }
}
