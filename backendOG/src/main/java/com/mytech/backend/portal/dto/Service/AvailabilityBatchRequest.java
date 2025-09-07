package com.mytech.backend.portal.dto.Service;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityBatchRequest {
    private LocalDate startDate;   // Ngày bắt đầu
    private LocalDate endDate;     // Ngày kết thúc
    private Integer totalSlots;    // Số slot mỗi ngày
}
