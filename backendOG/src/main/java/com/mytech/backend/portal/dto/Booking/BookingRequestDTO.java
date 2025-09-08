package com.mytech.backend.portal.dto.Booking;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequestDTO {
    private List<BookingServiceDTO> services;
    private List<Long> comboIds;
    private List<Long> equipmentIds;
    private String note;
}
