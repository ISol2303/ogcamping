package com.mytech.backend.portal.dto.Shift;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShiftRequestDTO {
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
}