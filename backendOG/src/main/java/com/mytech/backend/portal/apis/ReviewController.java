package com.mytech.backend.portal.apis;


import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.mytech.backend.portal.dto.Review.ReviewRequestDTO;
import com.mytech.backend.portal.dto.Review.ReviewResponseDTO;
import com.mytech.backend.portal.models.User;
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
    @PostMapping("/service/{serviceId}")
    public ResponseEntity<ReviewResponseDTO> createReview(
            @PathVariable("serviceId") Long serviceId,
            @RequestBody ReviewRequestDTO request,
            Authentication authentication) {

        // Lấy email từ JWT (sub)
        String email = authentication.getName();  

        // Tìm user theo email
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long customerId = user.getId();

        return ResponseEntity.ok(reviewService.createReview(customerId, serviceId, request));
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

    // Admin reply review
    @PutMapping("/{reviewId}/reply")
    public ResponseEntity<ReviewResponseDTO> replyReviews(
            @PathVariable Long reviewId,
            @RequestBody String reply) {
        return ResponseEntity.ok(reviewService.replyToReview(reviewId, reply));
    }
}
