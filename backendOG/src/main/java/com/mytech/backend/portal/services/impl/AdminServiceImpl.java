package com.mytech.backend.portal.services.impl;

import com.mytech.backend.portal.dto.StatDTO;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.OrderBookingRepository;
import com.mytech.backend.portal.repositories.PackageRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import com.mytech.backend.portal.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private OrderBookingRepository orderBookingRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<StatDTO> getStats(String period) {
        List<StatDTO> stats = new ArrayList<>();
        
        // Define time range based on period
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;
        switch (period.toLowerCase()) {
            case "weekly":
                startDate = now.minus(7, ChronoUnit.DAYS);
                break;
            case "monthly":
                startDate = now.minus(1, ChronoUnit.MONTHS);
                break;
            case "yearly":
                startDate = now.minus(1, ChronoUnit.YEARS);
                break;
            default:
                startDate = now.minus(1, ChronoUnit.MONTHS); // Default to monthly
        }

        // Revenue Stat
        double totalRevenue = orderBookingRepository.findAll().stream()
                .filter(ob -> ob.getOrderDate().isAfter(startDate))
                .mapToDouble(ob -> ob.getTotalPrice() != null ? ob.getTotalPrice() : 0)
                .sum();
        StatDTO revenueStat = new StatDTO();
        revenueStat.setTitle("Total Revenue");
        revenueStat.setValue(String.format("%,.0f VND", totalRevenue));
        revenueStat.setIcon("dollar");
        revenueStat.setColor("text-green-600");
        revenueStat.setChange("+5%"); // Mocked change, replace with actual calculation if needed
        stats.add(revenueStat);

        // Bookings Stat
        long totalBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt().isAfter(startDate))
                .count();
        StatDTO bookingsStat = new StatDTO();
        bookingsStat.setTitle("Total Bookings");
        bookingsStat.setValue(String.valueOf(totalBookings));
        bookingsStat.setIcon("calendar");
        bookingsStat.setColor("text-blue-600");
        bookingsStat.setChange("+10%"); // Mocked
        stats.add(bookingsStat);

        // Customers Stat
        long totalCustomers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.mytech.backend.portal.models.User.Role.CUSTOMER)
                .filter(u -> u.getCreatedAt().isAfter(startDate))
                .count();
        StatDTO customersStat = new StatDTO();
        customersStat.setTitle("New Customers");
        customersStat.setValue(String.valueOf(totalCustomers));
        customersStat.setIcon("users");
        customersStat.setColor("text-purple-600");
        customersStat.setChange("+8%"); // Mocked
        stats.add(customersStat);

        // Services Stat
        long totalServices = packageRepository.count();
        StatDTO servicesStat = new StatDTO();
        servicesStat.setTitle("Active Services");
        servicesStat.setValue(String.valueOf(totalServices));
        servicesStat.setIcon("package");
        servicesStat.setColor("text-yellow-600");
        servicesStat.setChange("+3%"); // Mocked
        stats.add(servicesStat);

        // Average Rating Stat
        double avgRating = bookingRepository.findAll().stream()
                .filter(b -> b.getRating() != null && b.getCreatedAt().isAfter(startDate))
                .mapToInt(b -> b.getRating() != null ? b.getRating() : 0)
                .average()
                .orElse(0.0);
        StatDTO ratingStat = new StatDTO();
        ratingStat.setTitle("Average Rating");
        ratingStat.setValue(String.format("%.1f", avgRating));
        ratingStat.setIcon("star");
        ratingStat.setColor("text-orange-600");
        ratingStat.setChange("+0.2"); // Mocked
        stats.add(ratingStat);

        return stats;
    }
}