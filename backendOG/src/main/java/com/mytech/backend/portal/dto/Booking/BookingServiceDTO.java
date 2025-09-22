package com.mytech.backend.portal.dto.Booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingServiceDTO {
    private Long serviceId;          // ID dịch vụ lưu trú
    private LocalDateTime checkInDate;   // Ngày check-in riêng
    private LocalDateTime checkOutDate;  // Ngày check-out riêng
    private Integer numberOfPeople;  // Số người dùng dịch vụ này
}
