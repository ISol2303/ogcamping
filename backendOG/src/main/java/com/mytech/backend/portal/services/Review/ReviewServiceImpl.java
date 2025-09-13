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
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
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
    

    // ✅ Thêm mới: nhận MultipartFile (upload ảnh/video thật sự)
    @Override
    public ReviewResponseDTO createReviewWithFiles(
            Long customerId,
            Long serviceId,
            Integer rating,
            String content,
            List<MultipartFile> images,
            List<MultipartFile> videos) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        com.mytech.backend.portal.models.Service.Service service =
                serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        Review review = Review.builder()
                .customer(customer)
                .service(service)
                .rating(rating != null ? rating : 5)
                .content(content != null ? content : "")
                .reply(null)
                .build();

        // ✅ Upload file & convert sang URL
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
        
     // ✅ Cập nhật averageRating & reviewCount trong Service
//        int oldCount = service.getReviewCount();
//        double oldAvg = service.getAverageRating();
//
//        double newAvg = ((oldAvg * oldCount) + review.getRating()) / (oldCount + 1);
//
//        service.setReviewCount(oldCount + 1);
//        service.setAverageRating(newAvg);
//
//        serviceRepository.save(service);

        return mapToResponse(review);
    }

    // ✅ Hàm helper để lưu file
    private String saveFile(MultipartFile file, String subDir) {
        try {
            // ✅ Đường dẫn lưu file thực tế
            String basePath = "D:/DANG/Git/ogcamping-git/ogcamping/backendOG/uploads/" + subDir;
            File dir = new File(basePath);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File dest = new File(dir, fileName);

            file.transferTo(dest);

            // ✅ Trả về URL public trùng với ResourceHandler
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
