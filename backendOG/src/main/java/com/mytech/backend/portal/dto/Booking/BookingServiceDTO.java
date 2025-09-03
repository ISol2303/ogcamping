package com.mytech.backend.portal.dto.Booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingServiceDTO {
    private Long serviceId;          // ID dịch vụ lưu trú
    private LocalDate checkInDate;   // Ngày check-in riêng
    private LocalDate checkOutDate;  // Ngày check-out riêng
    private Integer numberOfPeople;  // Số người dùng dịch vụ này
}
