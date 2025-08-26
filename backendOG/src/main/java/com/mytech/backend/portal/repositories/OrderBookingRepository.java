package com.mytech.backend.portal.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mytech.backend.portal.models.OrderBooking;

@Repository
public interface OrderBookingRepository extends JpaRepository<OrderBooking, Long> {
	List<OrderBooking> findByEmail(String email);
}

