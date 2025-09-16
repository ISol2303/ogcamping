package com.mytech.backend.portal.dto.Booking;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingItemDTO(
        Long bookingItemId,
        Integer quantity,
        Double price,
        LocalDateTime checkInDate,
        LocalDateTime checkOutDate
) {}