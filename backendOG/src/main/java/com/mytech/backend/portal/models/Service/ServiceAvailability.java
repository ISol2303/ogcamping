package com.mytech.backend.portal.models.Service;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "service_availability")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    private LocalDate date;       // Ngày áp dụng (VD: 2025-08-21)

    private Integer totalSlots;   // Tổng số chỗ trong ngày (VD: 5)
    private Integer bookedSlots;  // Số chỗ đã được đặt (VD: 2)

    public Integer getAvailableSlots() {
        return totalSlots - bookedSlots;
    }
}
