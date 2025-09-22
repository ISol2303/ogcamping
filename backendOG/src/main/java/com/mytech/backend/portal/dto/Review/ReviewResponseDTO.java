package com.mytech.backend.portal.dto.Review;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

import com.mytech.backend.portal.models.Review.ReviewStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDTO {

    private Long id;

    private Long customerId;
    private String customerName;
    private String customerAvatar;

    private Long serviceId;
    private String serviceName;

    private Integer rating;
    private String content;

    private List<String> images;
    private List<String> videos;

    private String reply;
    private LocalDateTime createdAt;
    
    private ReviewStatus status;
    private Long moderatedById;
    private String moderatedByName;
    private LocalDateTime moderatedAt;
    private String moderationReason;
}
