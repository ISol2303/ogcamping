package com.mytech.backend.portal.dto;

import java.time.LocalDateTime;

public class BookingDTO {
    private Long id;
    private String phone;        // số điện thoại khách đặt
    private String email;        // email khách đặt
    private String note;         // ghi chú
    private String createdBy;    // "guest" hoặc userId
    private String priority;     // LOW, MEDIUM, HIGH
    private String customerName; // tên hiển thị khách hàng
    private String service;
    private String date;         // để String cho dễ test Postman
    private String image;
    private String status;       // PENDING, CONFIRMED, CANCELLED
    private Double amount;
    private Integer rating;
    private LocalDateTime createdAt;

    
}