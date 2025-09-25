package com.mytech.backend.portal.services.Review;


import com.mytech.backend.portal.dto.Review.ReviewRequestDTO;
import com.mytech.backend.portal.dto.Review.ReviewResponseDTO;
import com.mytech.backend.portal.dto.Review.ReviewStatusUpdateDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Review.Review;
import com.mytech.backend.portal.models.Review.ReviewStatus;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.CustomerRepository;
import com.mytech.backend.portal.repositories.ReviewRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;

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
        
        //  Cập nhật rating cho service
        updateServiceRating(service, review.getRating());
        return mapToResponse(review);
    }
    

    // Thêm mới: nhận MultipartFile (upload ảnh/video thật sự)
    @Override
    public ReviewResponseDTO createReviewWithFiles(
            Long customerId,
            Long serviceId,
            Long bookingId,
            Integer rating,
            String content,
            List<MultipartFile> images,
            List<MultipartFile> videos) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        com.mytech.backend.portal.models.Service.Service service =
                serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Review review = Review.builder()
                .customer(customer)
                .service(service)
                .booking(booking)
                .rating(rating != null ? rating : 5)
                .content(content != null ? content : "")
                .reply(null)
                .status(ReviewStatus.PENDING)
                .build();

        // Upload file & convert sang URL
        List<String> imageUrls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile img : images) {
                imageUrls.add(saveFile(img, "reviews/images"));
            }
        }

        List<String> videoUrls = new ArrayList<>();
        if (videos != null) {
            for (MultipartFile vid : videos) {
                videoUrls.add(saveFile(vid, "reviews/videos"));
            }
        }

        review.setImages(imageUrls);
        review.setVideos(videoUrls);
        reviewRepository.save(review);
        
        // Sau khi tạo review -> set hasReview
        booking.setHasReview(true);
        bookingRepository.save(booking);
        
        // Cập nhật totalReviews & averageRating trong Service
       // updateServiceRating(service, review.getRating());
        reviewRepository.save(review);
        return mapToResponse(review);
    }
    
    private void updateServiceRating(com.mytech.backend.portal.models.Service.Service service, Integer newRating) {
        int oldCount = service.getTotalReviews() != null ? service.getTotalReviews() : 0;
        double oldAvg = service.getAverageRating() != null ? service.getAverageRating() : 0.0;

        double newAvg = ((oldAvg * oldCount) + newRating) / (oldCount + 1);

        service.setTotalReviews(oldCount + 1);
        service.setAverageRating(newAvg);

        serviceRepository.save(service);
    }

    // Hàm helper để lưu file
    private String saveFile(MultipartFile file, String subDir) {
        try {
            // Đường dẫn lưu file thực tế
            String basePath = "D:/DANG/Git/ogcamping-git/ogcamping/backendOG/uploads/" + subDir;
            File dir = new File(basePath);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File dest = new File(dir, fileName);

            file.transferTo(dest);

            // Trả về URL public trùng với ResourceHandler
            return "/uploads/" + subDir + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Error saving file", e);
        }
    }
    

    @Override
    public List<ReviewResponseDTO> getReviewsForService(Long serviceId) {
    	com.mytech.backend.portal.models.Service.Service service = 
    	        serviceRepository.findById(serviceId)
    	        .orElseThrow(() -> new RuntimeException("Service not found"));


    	return reviewRepository.findByServiceAndStatus(service, ReviewStatus.APPROVED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByCustomer(Long customerId) {
        return reviewRepository.findByCustomerId(customerId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
 // staff list

    @Override
    public List<ReviewResponseDTO> listAllReviews() {
        return reviewRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    @Override
    public List<ReviewResponseDTO> listReviewsByStatus(ReviewStatus status) {
        return reviewRepository.findByStatus(status).stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    @Override
    public ReviewResponseDTO updateReviewStatus(Long reviewId, ReviewStatusUpdateDTO dto, Long moderatorId, String moderatorName) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new RuntimeException("Review not found"));
        ReviewStatus old = review.getStatus();
        ReviewStatus now = dto.getStatus();

        if (old == now) {
            // chỉ cập nhật reason/name/time nếu cần
            review.setModerationReason(dto.getReason());
            review.setModeratedAt(LocalDateTime.now());
            review.setModeratedById(moderatorId);
            review.setModeratedByName(moderatorName);
            reviewRepository.save(review);
            return mapToResponse(review);
        }

        // chuyển từ ANY -> APPROVED: thêm rating vào service
        if (now == ReviewStatus.APPROVED && old != ReviewStatus.APPROVED) {
            updateServiceRatingOnApprove(review.getService(), review.getRating());
        }

        // chuyển từ APPROVED -> (REJECTED|HIDDEN): loại bỏ rating khỏi service
        if (old == ReviewStatus.APPROVED && now != ReviewStatus.APPROVED) {
            updateServiceRatingOnRemoval(review.getService(), review.getRating());
        }

        review.setStatus(now);
        review.setModerationReason(dto.getReason());
        review.setModeratedAt(LocalDateTime.now());
        review.setModeratedById(moderatorId);
        review.setModeratedByName(moderatorName);

        reviewRepository.save(review);
        return mapToResponse(review);
    }
    
    // helper: giống / chỉnh sửa hàm updateServiceRating
    private void updateServiceRatingOnApprove(com.mytech.backend.portal.models.Service.Service service, Integer newRating) {
        int oldCount = service.getTotalReviews() != null ? service.getTotalReviews() : 0;
        double oldAvg = service.getAverageRating() != null ? service.getAverageRating() : 0.0;
        double newAvg = ((oldAvg * oldCount) + newRating) / (oldCount + 1);
        service.setTotalReviews(oldCount + 1);
        service.setAverageRating(newAvg);
        serviceRepository.save(service);
    }

    private void updateServiceRatingOnRemoval(com.mytech.backend.portal.models.Service.Service service, Integer removedRating) {
        int oldCount = service.getTotalReviews() != null ? service.getTotalReviews() : 0;
        double oldAvg = service.getAverageRating() != null ? service.getAverageRating() : 0.0;

        if (oldCount <= 1) {
            service.setTotalReviews(0);
            service.setAverageRating(0.0);
        } else {
            double newAvg = ((oldAvg * oldCount) - removedRating) / (oldCount - 1);
            service.setTotalReviews(oldCount - 1);
            service.setAverageRating(newAvg);
        }
        serviceRepository.save(service);
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
                .customerName(review.getCustomer().getName())
                .customerAvatar(review.getCustomer().getAvatar())
                .serviceId(review.getService().getId())
                .serviceName(review.getService().getName())
                .rating(review.getRating())
                .content(review.getContent())
                .images(review.getImages())
                .videos(review.getVideos())
                .reply(review.getReply())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())

                // các field moderation
                .moderatedById(review.getModeratedById())
                .moderatedByName(review.getModeratedByName())
                .moderatedAt(review.getModeratedAt())
                .moderationReason(review.getModerationReason())
                .build();
    }

}
