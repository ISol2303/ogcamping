package com.mytech.backend.portal.services.impl;

import com.mytech.backend.portal.dto.StatDTO;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.GearRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import com.mytech.backend.portal.services.StatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class StatServiceImpl implements StatService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GearRepository gearRepository;

    @Override
    public List<StatDTO> getStats(String period) {
        // TODO: Filter theo period nếu cần (ví dụ: tháng, tuần, ngày)

        double revenue = bookingRepository.findAll().stream()
                .flatMap(booking -> booking.getItems().stream()) // đi qua tất cả BookingItem
                .mapToDouble(item -> item.getPrice() != null ? item.getPrice() : 0.0)
                .sum();

        return Arrays.asList(
                new StatDTO("Total Users", String.valueOf(userRepository.count()), "users", "blue", "+5%"),
                new StatDTO("Total Bookings", String.valueOf(bookingRepository.count()), "bookings", "green", "+10%"),
                new StatDTO("Total Equipment", String.valueOf(gearRepository.count()), "equipment", "orange", "+2%"),
                new StatDTO("Revenue", String.format("$%.2f", revenue), "dollar", "purple", "+15%")
        );
    }
}
