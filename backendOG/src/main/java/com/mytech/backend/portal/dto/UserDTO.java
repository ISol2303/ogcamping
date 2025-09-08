package com.mytech.backend.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String name;
    private String email;
    private String role;
    private String avatar;
    private String password;
    private String phone;
    private String department;
    private LocalDate joinDate;
    private String status;
    private Boolean agreeMarketing;
    private String address;
    private LocalDateTime CreatedAt;


}