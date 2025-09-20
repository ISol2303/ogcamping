package com.mytech.backend.portal.dto.Booking;

import com.mytech.backend.portal.models.Booking.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private String name;
    private Integer quantity;
    private Double price;
    private Double total;
}
