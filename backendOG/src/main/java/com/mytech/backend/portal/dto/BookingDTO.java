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

    // --- Constructors ---
    public BookingDTO() {}

    public BookingDTO(Long id, String phone, String email, String note, String createdBy,
                      String priority, String customerName, String service, String date,
                      String image, String status, Double amount, Integer rating,
                      LocalDateTime createdAt) {
        this.id = id;
        this.phone = phone;
        this.email = email;
        this.note = note;
        this.createdBy = createdBy;
        this.priority = priority;
        this.customerName = customerName;
        this.service = service;
        this.date = date;
        this.image = image;
        this.status = status;
        this.amount = amount;
        this.rating = rating;
        this.createdAt = createdAt;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getNote() {
        return note;
    }
    public void setNote(String note) {
        this.note = note;
    }

    public String getCreatedBy() {
        return createdBy;
    }
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getPriority() {
        return priority;
    }
    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getCustomerName() {
        return customerName;
    }
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getService() {
        return service;
    }
    public void setService(String service) {
        this.service = service;
    }

    public String getDate() {
        return date;
    }
    public void setDate(String date) {
        this.date = date;
    }

    public String getImage() {
        return image;
    }
    public void setImage(String image) {
        this.image = image;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public Double getAmount() {
        return amount;
    }
    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Integer getRating() {
        return rating;
    }
    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
