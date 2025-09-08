package com.mytech.backend.portal.dto.Booking;

import lombok.*;

import java.time.LocalDate;

import com.mytech.backend.portal.models.Booking.ItemType;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingItemResponseDTO {
    private Long id;
    private Long serviceId;
    private Long comboId;
    private Long euipmentId;
    private Long bookingId;
    private ItemType type;
    private Long numberOfPeople;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String name;
    private Integer quantity;
    private Double price;
    private Double total;
}
