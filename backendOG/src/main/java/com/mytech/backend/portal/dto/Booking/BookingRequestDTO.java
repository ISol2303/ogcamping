package com.mytech.backend.portal.dto.Booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequestDTO {
    private List<BookingServiceDTO> services;
    private List<BookingComboDTO> combos;
    private List<Long> equipmentIds;
    private String note;
}
