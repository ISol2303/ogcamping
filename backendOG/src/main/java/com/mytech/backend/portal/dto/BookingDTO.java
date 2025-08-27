package com.mytech.backend.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private String customer;
    private String service;
    private String date;
    private String image;
    private String status;
    private Double amount;
    private Integer rating;
    private LocalDateTime createdAt;

    
}