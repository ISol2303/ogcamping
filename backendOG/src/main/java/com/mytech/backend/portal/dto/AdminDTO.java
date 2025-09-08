package com.mytech.backend.portal.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDTO {
    private String id;
    private String name;
    private String email;
    private String role;
    private String department;
    private String joinDate;
    private String status;

}