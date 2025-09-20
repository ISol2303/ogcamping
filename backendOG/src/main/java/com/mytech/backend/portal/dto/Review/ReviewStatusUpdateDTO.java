package com.mytech.backend.portal.dto.Review;

import com.mytech.backend.portal.models.Review.ReviewStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewStatusUpdateDTO {
    private ReviewStatus status; // APPROVED / REJECTED
    private String reason; // optional
}