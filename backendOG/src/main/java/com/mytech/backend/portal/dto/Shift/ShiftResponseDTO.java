package com.mytech.backend.portal.dto.Shift;

import com.mytech.backend.portal.models.Shift.AssignmentRole;
import com.mytech.backend.portal.models.Shift.ShiftStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ShiftResponseDTO {
    private Long id;
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ShiftStatus status;
    private List<AssignmentDTO> assignments;

    @Data
    @AllArgsConstructor
    public static class AssignmentDTO {
        private Long userId;
        private String userName;
        private AssignmentRole role;
    }
}
