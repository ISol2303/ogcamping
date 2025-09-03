package com.mytech.backend.portal.dto.Combo;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboRequestDTO {
    private String name;
    private String description;
    private Double price;
    private Double originalPrice;   // Giá gốc (nếu có)
    private Integer discount;       // % giảm giá
    private Boolean active;
    private String location;
    private String duration;
    private Integer minPeople;
    private Integer maxPeople;
    private Integer minDays;
    private Integer maxDays;
    private List<String> highlights;
    private List<String> tags;
    private List<ComboServiceDTO> services;
    private List<String> equipment;
    private List<String> foods;
}
