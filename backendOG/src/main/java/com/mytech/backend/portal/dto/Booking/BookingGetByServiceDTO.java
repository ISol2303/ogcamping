package com.mytech.backend.portal.dto.Booking;

import java.time.LocalDateTime;
import java.util.List;

public record BookingGetByServiceDTO(
        Long bookingId,
        String customerName,
        LocalDateTime checkInDate,
        LocalDateTime checkOutDate,
        Integer numberOfPeople,
        String status,
        List<BookingItemDTO> items
) {}