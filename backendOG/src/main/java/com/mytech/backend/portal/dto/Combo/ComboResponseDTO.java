package com.mytech.backend.portal.dto.Combo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboResponseDTO {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private Double originalPrice;
    private Integer discount;
    private String imageUrl;
    private Boolean active;


    private Double rating;
    private Integer reviewCount;

    private String location;
    private String duration;
    private Integer minDays;
    private Integer maxDays;
    private Integer minPeople;
    private Integer maxPeople;

    private List<String> highlights;

    private List<String> tags;

    private List<ComboItemResponseDTO> items;

    private List<String> equipment;
    private List<String> foods;
}