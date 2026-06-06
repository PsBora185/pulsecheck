package com.pulsecheck.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${FRONTEND_URL:}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = new ArrayList<>();
        origins.add("http://localhost:5173");
        origins.add("http://127.0.0.1:5173");
        origins.add("http://localhost:3005");
        origins.add("http://127.0.0.1:3005");
        origins.add("http://localhost:8000");
        origins.add("http://127.0.0.1:8000");
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            origins.add(frontendUrl);
        }

        registry.addMapping("/**")
                .allowedOrigins(origins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
