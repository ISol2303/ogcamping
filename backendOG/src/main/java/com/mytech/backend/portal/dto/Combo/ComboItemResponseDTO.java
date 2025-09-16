package com.mytech.backend.portal.dto.Combo;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboItemResponseDTO {
    private Long serviceId;
    private String serviceName;
    private Integer quantity;
    private Double price; // lấy từ service.getPrice()
}