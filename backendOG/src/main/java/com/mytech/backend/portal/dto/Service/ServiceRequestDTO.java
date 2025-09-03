package com.mytech.backend.portal.dto.Service;


import com.mytech.backend.portal.models.Service.ServiceTag;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestDTO {
    private String name;
    private String description;
    private Double price;
    private String location;
<<<<<<< HEAD
=======
    private Boolean isExperience;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    private Integer minDays;
    private Integer maxDays;
    private Integer minCapacity;
    private Integer maxCapacity;
<<<<<<< HEAD
    private Integer availableSlots;
    private String duration;       // VD: "2-3 ngày"
    private String capacity;       // VD: "4-6 người"
    private ServiceTag tag;            // POPULAR / NEW / DISCOUNT
    private List<String> highlights; // danh sách điểm nổi bật
    private List<String> included;   // danh sách dịch vụ bao gồm
    private List<ItineraryDTO> itinerary; // lịch trình
=======
    private Boolean allowExtraPeople;
    private Double extraFeePerPerson;
    private Integer maxExtraPeople;
    private Boolean requireAdditionalSiteIfOver;
    private Integer defaultSlotsPerDay;
    private String duration;
    private String capacity;
    private ServiceTag tag;         // POPULAR / NEW / DISCOUNT
    private List<String> highlights;
    private List<String> included;
    private List<ItineraryDTO> itinerary;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
}

