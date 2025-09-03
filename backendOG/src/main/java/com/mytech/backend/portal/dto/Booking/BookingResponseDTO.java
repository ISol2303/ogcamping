package com.mytech.backend.portal.dto.Booking;

import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import  lombok.*;

import java.time.LocalDate;
<<<<<<< HEAD

@Data
@Builder
public class BookingResponseDTO {
    private Long id;
    private Long customerId;
    private String serviceName;
    private String comboName;
=======
import java.util.List;

import lombok.Builder;
import lombok.Data;

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
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfPeople;
    private BookingStatus status;
    private PaymentResponseDTO payment;
    private String note;
<<<<<<< HEAD
}
=======
    private Double totalPrice;
}


>>>>>>> 4b112d9 (Add or update frontend & backend code)
