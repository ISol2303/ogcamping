package com.mytech.backend.portal.dto.Combo;
import lombok.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboRequestDTO {
    private String name;
    private String description;
    private Double price;
    private Boolean active;
}