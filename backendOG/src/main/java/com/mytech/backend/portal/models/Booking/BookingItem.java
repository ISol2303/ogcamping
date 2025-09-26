package com.mytech.backend.portal.models.Booking;

import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Equipment.Equipment;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.models.Dish;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @ManyToOne
    @JoinColumn(name = "dish_id")
    private Dish dish;

    private Integer quantity;
    private Double price;
    // 🔹 Các field mới để lưu theo từng dịch vụ lưu trú
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private Integer numberOfPeople;
}


