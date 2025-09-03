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
<<<<<<< HEAD
//        TODO: Implement actual logic based on period parameter (e.g., filter by date range)
        double revenue = bookingRepository.findAll().stream()
                .mapToDouble(booking -> booking.getService().getPrice() != null ? booking.getService().getPrice() : 0.0)
=======
        // TODO: Filter theo period nếu cần (ví dụ: tháng, tuần, ngày)

        double revenue = bookingRepository.findAll().stream()
                .flatMap(booking -> booking.getItems().stream()) // đi qua tất cả BookingItem
                .mapToDouble(item -> item.getPrice() != null ? item.getPrice() : 0.0)
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                .sum();

        return Arrays.asList(
                new StatDTO("Total Users", String.valueOf(userRepository.count()), "users", "blue", "+5%"),
                new StatDTO("Total Bookings", String.valueOf(bookingRepository.count()), "bookings", "green", "+10%"),
                new StatDTO("Total Equipment", String.valueOf(gearRepository.count()), "equipment", "orange", "+2%"),
                new StatDTO("Revenue", String.format("$%.2f", revenue), "dollar", "purple", "+15%")
        );
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> 4b112d9 (Add or update frontend & backend code)
