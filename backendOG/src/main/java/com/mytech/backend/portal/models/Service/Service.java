package com.mytech.backend.portal.models.Service;

import com.mytech.backend.portal.models.Booking.Booking;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "services")
@Getter
@Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double price;
    private String location;
    private Integer minDays;
    private Integer maxDays;
    private Integer minCapacity;
    private Integer maxCapacity;
    private Boolean active = true;
    private Double averageRating;
    private Integer totalReviews;
    private Integer availableSlots;

    @Enumerated(EnumType.STRING)
    private ServiceTag tag;   // POPULAR / NEW / DISCOUNT
    private String imageUrl;
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();
}
