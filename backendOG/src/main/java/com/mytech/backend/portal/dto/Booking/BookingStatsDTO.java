package com.mytech.backend.portal.dto.Booking;

import lombok.*;

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
