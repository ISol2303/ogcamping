package com.mytech.backend.portal.dto.Booking;

import com.mytech.backend.portal.models.Booking.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
