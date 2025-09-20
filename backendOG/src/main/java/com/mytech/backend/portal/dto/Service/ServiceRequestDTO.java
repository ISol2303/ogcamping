package com.mytech.backend.portal.dto.Service;


import com.mytech.backend.portal.models.Service.ServiceTag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Boolean isExperience;
    private Integer minDays;
    private Integer maxDays;
    private Integer minCapacity;
    private Integer maxCapacity;
    private Boolean allowExtraPeople;
    private Boolean active;
    private Double extraFeePerPerson;
    private Integer maxExtraPeople;
    private Boolean requireAdditionalSiteIfOver;
    private Integer defaultSlotsPerDay;
    private String duration;
    private String capacity;
    private ServiceTag tag;
    private List<String> highlights;
    private List<String> included;
    private List<ItineraryDTO> itinerary;

    private Boolean keepImageUrl;
    private List<String> extraImageUrls;
}

