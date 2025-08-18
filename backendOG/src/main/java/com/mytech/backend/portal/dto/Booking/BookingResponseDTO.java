package com.mytech.backend.portal.dto.Booking;

import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import  lombok.*;

import java.time.LocalDate;

@Data
@Builder
public class BookingResponseDTO {
    private Long id;
    private Long customerId;
    private String serviceName;
    private String comboName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfPeople;
    private BookingStatus status;
    private PaymentResponseDTO payment;
    private String note;
}