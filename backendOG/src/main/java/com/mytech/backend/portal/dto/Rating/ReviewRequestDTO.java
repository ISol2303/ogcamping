package com.mytech.backend.portal.dto.Rating;
import lombok.*;
@Data
public class ReviewRequestDTO {
    private Integer rating;  // 1-5
    private String feedback;
}