package com.mytech.backend.portal.dto.Combo;
<<<<<<< HEAD
import lombok.*;
=======
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
>>>>>>> 4b112d9 (Add or update frontend & backend code)

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboResponseDTO {
<<<<<<< HEAD
=======

>>>>>>> 4b112d9 (Add or update frontend & backend code)
    private Long id;
    private String name;
    private String description;
    private Double price;
<<<<<<< HEAD
    private Boolean active;
}
=======
    private Double originalPrice;
    private Integer discount;
    private String imageUrl;
    private Boolean active;

    private Double rating;
    private Integer reviewCount;

    private String location;
    private String duration;

    private Integer minPeople;
    private Integer maxPeople;

    private List<String> highlights;

    private List<String> tags;

    private List<ComboItemResponseDTO> items;

    private List<String> equipment;
    private List<String> foods;
}
>>>>>>> 4b112d9 (Add or update frontend & backend code)
