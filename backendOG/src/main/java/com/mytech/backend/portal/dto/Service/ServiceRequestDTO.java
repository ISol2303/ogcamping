package com.mytech.backend.portal.dto.Service;


import lombok.*;

import java.util.List;

import com.mytech.backend.portal.models.Service.ServiceTag;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestDTO {
    private String name;
    private String description;
    private Double price;
    private String location;
    private Boolean isExperience;
    private Integer minDays;
    private Integer maxDays;
    private Integer minCapacity;
    private Integer maxCapacity;
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
}

