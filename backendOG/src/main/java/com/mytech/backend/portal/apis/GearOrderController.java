package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Order.GearOrderResponseDTO;
import com.mytech.backend.portal.repositories.OrderBookingRepository;
import com.mytech.backend.portal.repositories.OrderBookingItemRepository;
import com.mytech.backend.portal.repositories.GearRepository;
import com.mytech.backend.portal.models.Gear;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/apis/gear-orders")
@CrossOrigin(origins = "*")
public class GearOrderController {

    @Autowired
    private OrderBookingRepository orderBookingRepository;

    @Autowired
    private OrderBookingItemRepository orderBookingItemRepository;
    
    @Autowired
    private GearRepository gearRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<List<GearOrderResponseDTO>> getGearOrdersByUser(@PathVariable Long userId) {
        try {
            // Lấy danh sách order IDs của user
            List<Long> orderIds = orderBookingRepository.findOrderIdsByUserId(userId);
            
            if (orderIds.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            
            // Lấy thông tin order và items
            List<GearOrderResponseDTO> orders = orderIds.stream()
                .map(orderId -> {
                    var order = orderBookingRepository.findById(orderId).orElse(null);
                    if (order == null) return null;
                    
                    var items = orderBookingItemRepository.findByOrderBookingId(orderId);
                    
                    return GearOrderResponseDTO.builder()
                        .id(order.getId())
                        .orderCode(order.getOrderCode())
                        .status(order.getStatus())
                        .totalPrice(order.getTotalPrice())
                        .customerName(order.getCustomerName())
                        .email(order.getEmail())
                        .phone(order.getPhone())
                        .createdOn(order.getCreatedOn())
                        .orderDate(order.getOrderDate())
                        .items(items.stream()
                            .map(item -> {
                                GearOrderResponseDTO.GearOrderItemDTO.GearOrderItemDTOBuilder builder = GearOrderResponseDTO.GearOrderItemDTO.builder()
                                    .id(item.getId())
                                    .itemType(item.getItemType())
                                    .itemId(item.getItemId())
                                    .quantity(item.getQuantity())
                                    .unitPrice(item.getUnitPrice())
                                    .totalPrice(item.getTotalPrice());
                                
                                // Lấy thông tin chi tiết sản phẩm nếu là GEAR
                                if ("GEAR".equals(item.getItemType())) {
                                    Gear gear = gearRepository.findById(item.getItemId()).orElse(null);
                                    if (gear != null) {
                                        builder.productName(gear.getName())
                                               .productImage(gear.getImage())
                                               .productDescription(gear.getDescription());
                                    }
                                }
                                
                                return builder.build();
                            })
                            .collect(Collectors.toList()))
                        .build();
                })
                .filter(order -> order != null)
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{userId}/details/{orderId}")
    public ResponseEntity<GearOrderResponseDTO> getGearOrderDetails(@PathVariable Long userId, @PathVariable Long orderId) {
        try {
            // Kiểm tra order có thuộc về user không
            List<Long> userOrderIds = orderBookingRepository.findOrderIdsByUserId(userId);
            if (!userOrderIds.contains(orderId)) {
                return ResponseEntity.notFound().build();
            }
            
            var order = orderBookingRepository.findById(orderId).orElse(null);
            if (order == null) {
                return ResponseEntity.notFound().build();
            }
            
            var items = orderBookingItemRepository.findByOrderBookingId(orderId);
            
            GearOrderResponseDTO orderDetails = GearOrderResponseDTO.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .customerName(order.getCustomerName())
                .email(order.getEmail())
                .phone(order.getPhone())
                .createdOn(order.getCreatedOn())
                .orderDate(order.getOrderDate())
                .items(items.stream()
                    .map(item -> {
                        GearOrderResponseDTO.GearOrderItemDTO.GearOrderItemDTOBuilder builder = GearOrderResponseDTO.GearOrderItemDTO.builder()
                            .id(item.getId())
                            .itemType(item.getItemType())
                            .itemId(item.getItemId())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .totalPrice(item.getTotalPrice());
                        
                        // Lấy thông tin chi tiết sản phẩm nếu là GEAR
                        if ("GEAR".equals(item.getItemType())) {
                            Gear gear = gearRepository.findById(item.getItemId()).orElse(null);
                            if (gear != null) {
                                builder.productName(gear.getName())
                                       .productImage(gear.getImage())
                                       .productDescription(gear.getDescription());
                            }
                        }
                        
                        return builder.build();
                    })
                    .collect(Collectors.toList()))
                .build();
                
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
