package com.pulsecheck.service;

import com.pulsecheck.config.JwtConfig;
import com.pulsecheck.dto.AuthResponse;
import com.pulsecheck.dto.LoginRequest;
import com.pulsecheck.dto.RegisterRequest;
import com.pulsecheck.model.User;
import com.pulsecheck.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setDisplayName(req.displayName() != null && !req.displayName().isBlank() ? req.displayName() : req.email());

        user = userRepository.save(user);
        String token = jwtConfig.generateToken(user);

        return new AuthResponse(token, user.getEmail(), user.getDisplayName());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtConfig.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getDisplayName());
    }
}
