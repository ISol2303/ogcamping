package com.mytech.backend.portal.dto.Service;
import com.mytech.backend.portal.models.Service.ServiceTag;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String location;
    private Integer minDays;
    private Integer maxDays;
    private Integer minCapacity;
    private Integer maxCapacity;
    private Integer availableSlots;
    private String duration;
    private String capacity;
    private ServiceTag tag;
    private Double averageRating;
    private Integer totalReviews;
    private String imageUrl;
    private List<String> highlights;
    private List<String> included;
    private List<ItineraryDTO> itinerary;
}
