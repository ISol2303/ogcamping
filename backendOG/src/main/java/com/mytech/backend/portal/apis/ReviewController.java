package com.mytech.backend.portal.apis;


import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.mytech.backend.portal.dto.Review.ReviewRequestDTO;
import com.mytech.backend.portal.dto.Review.ReviewResponseDTO;
import com.mytech.backend.portal.dto.Review.ReviewStatusUpdateDTO;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.models.Review.ReviewStatus;
import com.mytech.backend.portal.services.UserService;
import com.mytech.backend.portal.services.Review.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/apis/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    
    private final UserService userService;
    // Tạo review mới
    @PostMapping(value = "/service/{serviceId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewResponseDTO> createReview(
            @PathVariable("serviceId") Long serviceId,
            @RequestPart("rating") String ratingStr,
            @RequestPart(value = "content", required = false) String content,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestPart(value = "videos", required = false) List<MultipartFile> videos,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long customerId = user.getId();
        int rating = Integer.parseInt(ratingStr);

        return ResponseEntity.ok(
                reviewService.createReviewWithFiles(customerId, serviceId,rating, content, images, videos)
        );
    }


    // Lấy review theo service
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsForService(@PathVariable("serviceId") Long serviceId) {
        return ResponseEntity.ok(reviewService.getReviewsForService(serviceId));
    }

    // Lấy review theo customer
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(reviewService.getReviewsByCustomer(customerId));
    }

    // Staff reply review
    @PutMapping("/{reviewId}/reply")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<ReviewResponseDTO> replyReviews(
    		@PathVariable("reviewId") Long reviewId,
            @RequestBody String reply) {
        return ResponseEntity.ok(reviewService.replyToReview(reviewId, reply));
    }
    
    // Staff: list theo status
    @GetMapping("/staff")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<ReviewResponseDTO>> listByStatus(
            @RequestParam(value = "status", required = false) String status) {

        // nếu không có param hoặc là "ALL" -> trả tất cả
        if (status == null || status.equalsIgnoreCase("ALL")) {
            return ResponseEntity.ok(reviewService.listAllReviews());
        }

        try {
            ReviewStatus rs = ReviewStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(reviewService.listReviewsByStatus(rs));
        } catch (IllegalArgumentException ex) {
            // trả về 400 nếu client gửi trạng thái không hợp lệ
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
        }
    }
    
    // Staff: cập nhật status (duyệt / từ chối / ẩn)
    @PutMapping("/{reviewId}/status")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<ReviewResponseDTO> updateStatus(
    		@PathVariable("reviewId") Long reviewId,
            @RequestBody ReviewStatusUpdateDTO dto,
            Authentication authentication) {

        String email = authentication.getName();
        User moderator = userService.findByEmail(email);

        return ResponseEntity.ok(
                reviewService.updateReviewStatus(reviewId, dto, moderator.getId(), moderator.getName())
        );
    }
}
