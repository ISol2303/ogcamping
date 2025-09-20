package com.mytech.backend.portal.repositories;


import org.springframework.data.jpa.repository.JpaRepository;

import com.mytech.backend.portal.models.Review.Review;
import com.mytech.backend.portal.models.Review.ReviewStatus;
import com.mytech.backend.portal.models.Service.Service;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
	List<Review> findByService(Service service);
    List<Review> findByServiceAndStatus(Service service, ReviewStatus status);
    List<Review> findByStatus(ReviewStatus status);
    List<Review> findByCustomerId(Long customerId);
    List<Review> findByCustomerIdAndStatus(Long customerId, ReviewStatus status);
    
}
