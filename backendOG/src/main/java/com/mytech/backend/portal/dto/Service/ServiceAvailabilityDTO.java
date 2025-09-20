package com.mytech.backend.portal.dto.Service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
