package com.mytech.backend.portal.dto.Booking;

import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.dto.Staff.AssignedStaffResponse;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponseDTO {
    private Long id;
    private Long customerId;
    private List<BookingItemResponseDTO> services;   // đổi từ serviceNames
    private List<BookingItemResponseDTO> combos;     // đổi từ comboNames
    private List<BookingItemResponseDTO> equipments; // đổi từ equipmentNames
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private LocalDateTime bookingDate;
    private Integer numberOfPeople;
    private BookingStatus status;
    private PaymentResponseDTO payment;
    private String note;
    private AssignedStaffResponse staff; // đổi từ User staffId
    private String internalNotes;
    private Double totalPrice;
}


