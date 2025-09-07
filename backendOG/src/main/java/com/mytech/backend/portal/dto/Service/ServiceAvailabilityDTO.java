package com.mytech.backend.portal.dto.Service;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAvailabilityDTO {
    private Long id;
    private LocalDate date;
    private Integer totalSlots;
    private Integer bookedSlots;
}
