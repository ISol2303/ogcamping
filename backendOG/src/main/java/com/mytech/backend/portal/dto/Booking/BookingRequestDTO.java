package com.mytech.backend.portal.dto.Booking;
import com.mytech.backend.portal.models.Payment.PaymentMethod;
import lombok.*;

import java.time.LocalDate;
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
