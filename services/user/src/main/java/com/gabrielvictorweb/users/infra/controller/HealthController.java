package com.gabrielvictorweb.users.infra.controller;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final Counter healthChecksCounter;

    public HealthController(MeterRegistry meterRegistry) {
        this.healthChecksCounter = Counter.builder("users_health_checks_total")
                .description("Total number of /health checks")
                .register(meterRegistry);
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        this.healthChecksCounter.increment();
        return Map.of(
                "status", "UP",
                "message", "Users Closed Chat API is running",
            "prometheusEndpoint", "/metrics",
                "metric", "users_health_checks_total");
    }
}
