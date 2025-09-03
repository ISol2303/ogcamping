package com.mytech.backend.portal.models.Booking;

import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Equipment.Equipment;
import com.mytech.backend.portal.models.Service.Service;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "booking_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    private ItemType type; // SERVICE, COMBO, EQUIPMENT

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;

    @ManyToOne
    @JoinColumn(name = "combo_id")
    private Combo combo;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    private Integer quantity;
    private Double price;
    // 🔹 Các field mới để lưu theo từng dịch vụ lưu trú
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfPeople;
}


