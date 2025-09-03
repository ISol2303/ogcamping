package com.mytech.backend.portal.dto.Booking;
import com.mytech.backend.portal.models.Payment.PaymentMethod;
import lombok.*;

import java.time.LocalDate;
<<<<<<< HEAD

@Data
public class BookingRequestDTO {
    private Long serviceId;
    private Long comboId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfPeople;
=======
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequestDTO {
    private List<BookingServiceDTO> services;
    private List<Long> comboIds;
    private List<Long> equipmentIds;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    private String note;
}
