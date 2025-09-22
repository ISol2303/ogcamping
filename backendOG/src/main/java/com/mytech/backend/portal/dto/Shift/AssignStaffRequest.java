package com.mytech.backend.portal.dto.Shift;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignStaffRequest {
    private Long staffId;
    private String role; // optional - AssignmentRole
}