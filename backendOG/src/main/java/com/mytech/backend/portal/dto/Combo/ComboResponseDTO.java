package com.mytech.backend.portal.dto.Combo;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Boolean active;
}
