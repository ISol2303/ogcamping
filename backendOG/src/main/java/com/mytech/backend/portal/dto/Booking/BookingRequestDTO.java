package com.mytech.backend.portal.dto.Booking;
import com.mytech.backend.portal.models.Payment.PaymentMethod;
import lombok.*;

import java.time.LocalDate;

@Data
public class BookingRequestDTO {
    private Long serviceId;
    private Long comboId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfPeople;
    private String note;
}
