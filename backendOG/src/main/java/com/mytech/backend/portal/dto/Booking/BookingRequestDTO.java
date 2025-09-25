package com.mytech.backend.portal.dto.Booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import com.mytech.backend.portal.dto.Customer.CustomerRequestDTO;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequestDTO {
    private List<BookingServiceDTO> services;
    private List<BookingComboDTO> combos;
    private List<Long> equipmentIds;
    private String note;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private Integer numberOfPeople;
}
