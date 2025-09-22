package com.mytech.backend.portal.dto.Staff;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignedStaffResponse {
    private Long id;
    private String name;
    private String role;
}

