package com.mytech.backend.portal.services.impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.StatDTO;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.OrderBookingRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import com.mytech.backend.portal.services.AdminService;

@Service
public class AdminServiceImpl implements AdminService {
    private static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private OrderBookingRepository orderBookingRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;
    
	@Override
	public List<StatDTO> getStats(String period) {
	    logger.info("Fetching stats for period: {}", period);
	    List<StatDTO> stats = new ArrayList<>();
	    try {
	        LocalDateTime now = LocalDateTime.now();
	        LocalDateTime startDate, prevStartDate;
	        switch (period.toLowerCase()) {
	            case "daily":
	                startDate = now.minus(1, ChronoUnit.DAYS);
	                prevStartDate = now.minus(2, ChronoUnit.DAYS);
	                break;
	            case "weekly":
	                startDate = now.minus(7, ChronoUnit.DAYS);
	                prevStartDate = now.minus(14, ChronoUnit.DAYS);
	                break;
	            case "monthly":
	                startDate = now.minus(1, ChronoUnit.MONTHS);
	                prevStartDate = now.minus(2, ChronoUnit.MONTHS);
	                break;
	            case "yearly":
	                startDate = now.minus(1, ChronoUnit.YEARS);
	                prevStartDate = now.minus(2, ChronoUnit.YEARS);
	                break;
	            default:
	                logger.warn("Invalid period '{}', defaulting to monthly", period);
	                throw new IllegalArgumentException("Invalid period parameter. Must be one of: daily, weekly, monthly, yearly");
	        }
	        return getStatsForRange(startDate, prevStartDate, now);
	    } catch (IllegalArgumentException e) {
	        logger.error("Invalid period parameter {}: {}", period, e.getMessage());
	        throw e;
	    } catch (Exception e) {
	        logger.error("Error fetching stats for period {}: {}", period, e.getMessage(), e);
	        throw new RuntimeException("Failed to fetch stats: " + e.getMessage(), e);
	    }
	}

    @Override
    public List<StatDTO> getStatsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Fetching stats for date range: {} to {}", startDate, endDate);
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            logger.warn("Invalid date range: startDate={}, endDate={}", startDate, endDate);
            throw new IllegalArgumentException("Invalid date range: startDate and endDate must be non-null and endDate must be after startDate");
        }

        try {
            long days = startDate.until(endDate, ChronoUnit.DAYS);
            LocalDateTime prevStartDate = startDate.minus(days, ChronoUnit.DAYS);
            return getStatsForRange(startDate, prevStartDate, endDate);
        } catch (Exception e) {
            logger.error("Error fetching stats for date range {} to {}: {}", startDate, endDate, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch stats: " + e.getMessage(), e);
        }
    }

    private List<StatDTO> getStatsForRange(LocalDateTime currentStart, LocalDateTime prevStart, LocalDateTime currentEnd) {
        List<StatDTO> stats = new ArrayList<>();

        try {
            // Revenue Stat
            double totalRevenue = orderBookingRepository.findAll().stream()
                    .filter(ob -> ob.getOrderDate() != null && ob.getOrderDate().isAfter(currentStart) && ob.getOrderDate().isBefore(currentEnd))
                    .mapToDouble(ob -> ob.getTotalPrice() != null ? ob.getTotalPrice() : 0)
                    .sum();
            double prevTotalRevenue = orderBookingRepository.findAll().stream()
                    .filter(ob -> ob.getOrderDate() != null && ob.getOrderDate().isAfter(prevStart) && ob.getOrderDate().isBefore(currentStart))
                    .mapToDouble(ob -> ob.getTotalPrice() != null ? ob.getTotalPrice() : 0)
                    .sum();
            String revenueChange = calculateChange(totalRevenue, prevTotalRevenue);
            stats.add(new StatDTO("Total Revenue", String.format("%,.0f VND", totalRevenue), "vnd", "text-green-600", revenueChange));

            // Bookings Stat
            long totalBookings = bookingRepository.findAll().stream()
                    .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(currentStart) && b.getCreatedAt().isBefore(currentEnd))
                    .count();
            long prevTotalBookings = bookingRepository.findAll().stream()
                    .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(prevStart) && b.getCreatedAt().isBefore(currentStart))
                    .count();
            String bookingsChange = calculateChange(totalBookings, prevTotalBookings);
            stats.add(new StatDTO("Total Bookings", String.valueOf(totalBookings), "calendar", "text-blue-600", bookingsChange));

            // Customers Stat
            long totalCustomers = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && u.getRole() == com.mytech.backend.portal.models.User.User.Role.CUSTOMER)
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(currentStart) && u.getCreatedAt().isBefore(currentEnd))
                    .count();
            long prevTotalCustomers = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && u.getRole() == com.mytech.backend.portal.models.User.User.Role.CUSTOMER)
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(prevStart) && u.getCreatedAt().isBefore(currentStart))
                    .count();
            String customersChange = calculateChange(totalCustomers, prevTotalCustomers);
            stats.add(new StatDTO("New Customers", String.valueOf(totalCustomers), "users", "text-purple-600", customersChange));

            // Services Stat
            long totalServices = serviceRepository.count();
            long prevTotalServices = totalServices; // Assume no change for simplicity
            String servicesChange = calculateChange(totalServices, prevTotalServices);
            stats.add(new StatDTO("Active Services", String.valueOf(totalServices), "package", "text-yellow-600", servicesChange));

            // Average Rating Stat
            double avgRating = bookingRepository.findAll().stream()
                    .filter(b -> b.getRating() != null && b.getCreatedAt() != null && b.getCreatedAt().isAfter(currentStart) && b.getCreatedAt().isBefore(currentEnd))
                    .mapToInt(b -> b.getRating() != null ? b.getRating() : 0)
                    .average()
                    .orElse(0.0);
            double prevAvgRating = bookingRepository.findAll().stream()
                    .filter(b -> b.getRating() != null && b.getCreatedAt() != null && b.getCreatedAt().isAfter(prevStart) && b.getCreatedAt().isBefore(currentStart))
                    .mapToInt(b -> b.getRating() != null ? b.getRating() : 0)
                    .average()
                    .orElse(0.0);
            String ratingChange = String.format("%.1f", avgRating - prevAvgRating);
            stats.add(new StatDTO("Average Rating", String.format("%.1f", avgRating), "star", "text-orange-600", ratingChange));

            logger.info("Successfully fetched {} stats", stats.size());
            return stats;
        } catch (Exception e) {
            logger.error("Error fetching stats for range {} to {}: {}", currentStart, currentEnd, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch stats: " + e.getMessage(), e);
        }
    }

    private String calculateChange(double current, double previous) {
        if (previous == 0) {
            return current == 0 ? "0%" : "+100%";
        }
        double change = ((current - previous) / previous) * 100;
        return String.format("%+.1f%%", change);
    }
}