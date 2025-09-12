package com.mytech.backend.portal.repositories;


import org.springframework.data.jpa.repository.JpaRepository;

import com.mytech.backend.portal.models.Review.Review;
import com.mytech.backend.portal.models.Service.Service;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByService(Service service);
    List<Review> findByCustomerId(Long customerId);
}
