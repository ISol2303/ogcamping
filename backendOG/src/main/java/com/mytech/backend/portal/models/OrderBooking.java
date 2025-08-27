package com.mytech.backend.portal.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_bookings")
public class OrderBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdOn;

    @Column(nullable = false)
    private LocalDateTime updatedOn;

    @Column(nullable = true)
    private LocalDateTime emailSentAt;

    @Version
    @Column(name = "version")
    private Integer version = 0;

    private LocalDateTime orderDate;

    @Column(unique = true, nullable = false)
    private String orderCode;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private Double totalPrice;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    private LocalDateTime bookingDate;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String email;

    private int people;
    private String phone;
    private String specialRequests;
    private String emergencyContact;
    private String emergencyPhone;
    private String priority;

    private LocalDateTime confirmedAt;

    // =========================
    // Lifecycle callbacks
    // =========================
    @PrePersist
    protected void onCreate() {
        createdOn = LocalDateTime.now();
        updatedOn = LocalDateTime.now();
        if (version == null) version = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedOn = LocalDateTime.now();
    }

    // =========================
    // Getters & Setters
    // =========================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public LocalDateTime getCreatedOn() { return createdOn; }
    public LocalDateTime getUpdatedOn() { return updatedOn; }
    public void setUpdatedOn(LocalDateTime updatedOn) { this.updatedOn = updatedOn; }

    public LocalDateTime getEmailSentAt() { return emailSentAt; }
    public void setEmailSentAt(LocalDateTime emailSentAt) { this.emailSentAt = emailSentAt; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public int getPeople() { return people; }
    public void setPeople(int people) { this.people = people; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getEmergencyPhone() { return emergencyPhone; }
    public void setEmergencyPhone(String emergencyPhone) { this.emergencyPhone = emergencyPhone; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
}
