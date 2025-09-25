package com.mytech.backend.portal.Utils;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

    private final SeedService seedService;

    @Bean
    CommandLineRunner seed() {
        return args -> {
            // Gọi public transactional method trên bean khác để transaction thực sự mở
            seedService.runSeed();
        };
    }
}
