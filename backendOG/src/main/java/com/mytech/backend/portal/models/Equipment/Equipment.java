package com.mytech.backend.portal.models.Equipment;

import com.mytech.backend.portal.models.Booking.BookingItem;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;        // VD: Lều 6 người
    private String description; // Mô tả
    private Double price;       // Giá thuê
    private Boolean active = true;

    private Integer stock;      // Số lượng tồn kho

    private String imageUrl;    // Ảnh minh họa

    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingItem> bookingItems = new ArrayList<>();
}
