package com.mytech.backend.portal.models.Service;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "service_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String user;      // Tên người review
    private Double rating;    // Điểm đánh giá
    private LocalDate date;
    private String comment;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;
}
