package com.pulsecheck.service;

import com.pulsecheck.config.JwtConfig;
import com.pulsecheck.dto.AuthResponse;
import com.pulsecheck.dto.LoginRequest;
import com.pulsecheck.dto.RegisterRequest;
import com.pulsecheck.model.User;
import com.pulsecheck.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;

    public AuthResponse register(RegisterRequest req) {
        log.info("Attempting to register user: {}", req.email());
        if (userRepository.findByEmail(req.email()).isPresent()) {
            log.warn("Registration failed - email already exists: {}", req.email());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setDisplayName(req.displayName() != null && !req.displayName().isBlank() ? req.displayName() : req.email());

        user = userRepository.save(user);
        log.info("Successfully registered user: {}, ID: {}", user.getEmail(), user.getId());
        String token = jwtConfig.generateToken(user);

        return new AuthResponse(token, user.getEmail(), user.getDisplayName());
    }

    public AuthResponse login(LoginRequest req) {
        log.info("Attempting login for user: {}", req.email());
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> {
                    log.warn("Login failed - user not found: {}", req.email());
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                });

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            log.warn("Login failed - password mismatch for user: {}", req.email());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        log.info("User login successful: {}", req.email());
        String token = jwtConfig.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getDisplayName());
    }
}
