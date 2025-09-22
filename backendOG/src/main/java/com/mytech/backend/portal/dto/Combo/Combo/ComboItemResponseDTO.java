package com.mytech.backend.portal.dto.Combo.Combo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboItemResponseDTO {
    private Long serviceId;
    private String serviceName;
    private Integer quantity;
    private Double price; // lấy từ service.getPrice()
}