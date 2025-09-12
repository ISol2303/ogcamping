package com.mytech.backend.portal.dto.Review;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDTO {

    private Long id;

    private Long customerId;
    private String customerName;

    private Long serviceId;
    private String serviceName;

    private Integer rating;
    private String content;

    private List<String> images;
    private List<String> videos;

    private String reply;
    private LocalDateTime createdAt;
}
