package com.mytech.backend.portal.services.Review;


import com.mytech.backend.portal.dto.Review.ReviewRequestDTO;
import com.mytech.backend.portal.dto.Review.ReviewResponseDTO;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Review.Review;
import com.mytech.backend.portal.repositories.CustomerRepository;
import com.mytech.backend.portal.repositories.ReviewRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;

    @Override
    public ReviewResponseDTO createReview(Long customerId, Long serviceId, ReviewRequestDTO request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        com.mytech.backend.portal.models.Service.Service service = 
                serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        
        if (request.getContent() == null) {
            request.setContent("");
        }
        if (request.getImages() == null) {
            request.setImages(new ArrayList<>());
        }
        if (request.getVideos() == null) {
            request.setVideos(new ArrayList<>());
        }


        Review review = Review.builder()
                .customer(customer)
                .service(service)
                .rating(request.getRating())
                .content(request.getContent())
                .images(request.getImages())
                .videos(request.getVideos())
                .reply(null)
                .build();

        reviewRepository.save(review);

        return mapToResponse(review);
    }

    @Override
    public List<ReviewResponseDTO> getReviewsForService(Long serviceId) {
    	com.mytech.backend.portal.models.Service.Service service = 
    	        serviceRepository.findById(serviceId)
    	        .orElseThrow(() -> new RuntimeException("Service not found"));


        return reviewRepository.findByService(service)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByCustomer(Long customerId) {
        return reviewRepository.findByCustomerId(customerId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ReviewResponseDTO replyToReview(Long reviewId, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setReply(reply);
        reviewRepository.save(review);
        return mapToResponse(review);
    }

    private ReviewResponseDTO mapToResponse(Review review) {
        return ReviewResponseDTO.builder()
                .id(review.getId())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getFirstName() + " " + review.getCustomer().getLastName())
                .serviceId(review.getService().getId())
                .serviceName(review.getService().getName())
                .rating(review.getRating())
                .content(review.getContent())
                .images(review.getImages())
                .videos(review.getVideos())
                .reply(review.getReply())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
