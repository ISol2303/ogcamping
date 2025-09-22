package com.mytech.backend.portal.dto.Order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GearOrderResponseDTO {
    private Long id;
    private String orderCode;
    private String status;
    private Double totalPrice;
    private String customerName;
    private String email;
    private String phone;
    private LocalDateTime createdOn;
    private LocalDateTime orderDate;
    private List<GearOrderItemDTO> items;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GearOrderItemDTO {
        private Long id;
        private String itemType;
        private Long itemId;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
        // Thông tin chi tiết sản phẩm
        private String productName;
        private String productImage;
        private String productDescription;
    }
}
