package com.mytech.backend.portal.models.Service;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_itinerary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String day;            // Ngày 1, Ngày 2...
    private String title;          // Tên hoạt động chính
    @ElementCollection
    @CollectionTable(name = "itinerary_activities", joinColumns = @JoinColumn(name = "itinerary_id"))
    @Column(name = "activity")
    private List<String> activities = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;
}
