package com.mytech.backend.portal.apis;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.dto.StatDTO;
import com.mytech.backend.portal.services.StatService;

@RestController
@RequestMapping("/apis/v1/stats")
public class StatController {
    @Autowired
    private StatService statService;

    @GetMapping
    public ResponseEntity<?> getStats(@RequestParam("period") String period) {
        try {
            // Normalize period to handle 'month' from frontend
            String normalizedPeriod = period.equalsIgnoreCase("month") ? "monthly" : period.toLowerCase();

            // Validate period
            if (!"daily".equals(normalizedPeriod) && 
                !"weekly".equals(normalizedPeriod) && 
                !"monthly".equals(normalizedPeriod)) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Invalid period parameter. Must be 'daily', 'weekly', or 'monthly'."));
            }

            // Fetch stats using StatService
            List<StatDTO> stats = statService.getStats(normalizedPeriod);
            return ResponseEntity.ok(new StatsResponse(stats));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to fetch stats: " + e.getMessage()));
        }
    }

    // Response classes
    static class StatsResponse {
        private List<StatDTO> stats; // Changed from List<Stat> to List<StatDTO>

        public StatsResponse(List<StatDTO> stats) {
            this.stats = stats;
        }

        public List<StatDTO> getStats() {
            return stats;
        }
    }

    static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }
    }
}