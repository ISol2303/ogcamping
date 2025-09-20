package com.mytech.backend.portal.dto.Booking;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookingStatsDTO {
    private Long totalBookings;
    private Long monthlyBookings;
    private Long revenue;
    private Long monthlyRevenue;
    private Double averageRating;
    private Double completionRate;
}
