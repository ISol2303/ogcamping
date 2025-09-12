package com.mytech.backend.portal.services.Review;



import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.mytech.backend.portal.dto.Review.ReviewRequestDTO;
import com.mytech.backend.portal.dto.Review.ReviewResponseDTO;

public interface ReviewService {

    ReviewResponseDTO createReview(Long customerId, Long serviceId, ReviewRequestDTO request);

    List<ReviewResponseDTO> getReviewsForService(Long serviceId);

    List<ReviewResponseDTO> getReviewsByCustomer(Long customerId);

    ReviewResponseDTO replyToReview(Long reviewId, String reply);
    
 // Nhận images/videos dạng MultipartFile
    ReviewResponseDTO createReviewWithFiles(
            Long customerId,
            Long serviceId,
            Integer rating,
            String content,
            List<MultipartFile> images,
            List<MultipartFile> videos
        );
}
