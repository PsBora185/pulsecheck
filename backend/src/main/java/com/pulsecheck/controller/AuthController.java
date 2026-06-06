package com.pulsecheck.controller;

import com.pulsecheck.dto.AuthResponse;
import com.pulsecheck.dto.LoginRequest;
import com.pulsecheck.dto.RegisterRequest;
import com.pulsecheck.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        log.info("REST request to register user: {}", request.email());
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        log.info("REST request to login user: {}", request.email());
        return authService.login(request);
    }
}
