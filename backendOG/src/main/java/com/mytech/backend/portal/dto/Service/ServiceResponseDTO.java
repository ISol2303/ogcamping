package com.mytech.backend.portal.dto.Service;
import com.mytech.backend.portal.models.Service.ServiceTag;
import lombok.*;
@Data
@Builder
public class ServiceResponseDTO {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private String location;
    private Integer minDays;
    private Integer maxDays;
    private Integer minCapacity;
    private Integer maxCapacity;
    private Boolean active;
    private ServiceTag tag;            // POPULAR / NEW / DISCOUNT
    private String imageUrl;

    // Thông tin rating và review
    private Double averageRating;  // Ví dụ 4.8
    private Integer totalReviews;  // Ví dụ 124

    // Số lượng còn trống (sử dụng để show available slots)
    private Integer availableSlots;
}