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
<<<<<<< HEAD
=======

>>>>>>> 4b112d9 (Add or update frontend & backend code)
    private Integer minDays;
    private Integer maxDays;
    private Integer minCapacity;
    private Integer maxCapacity;
<<<<<<< HEAD
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
=======
    private Boolean isExperience;
    private Boolean active;
    private Double averageRating;
    private Integer totalReviews;
    private String duration;     // ví dụ: "2-3 ngày"
    private String capacity;     // ví dụ: "4-6 người"

    private ServiceTag tag;      // POPULAR / NEW / DISCOUNT
    private String imageUrl;
    private List<String> extraImageUrls;

    private List<String> highlights;
    private List<String> included;
    private Boolean allowExtraPeople ;
    private Double extraFeePerPerson ;
    private Integer maxExtraPeople;

    private Boolean requireAdditionalSiteIfOver;
    // Lịch trình chi tiết
    private List<ItineraryDTO> itinerary;

    // Availability theo ngày
    private List<ServiceAvailabilityDTO> availability;
}

>>>>>>> 4b112d9 (Add or update frontend & backend code)
