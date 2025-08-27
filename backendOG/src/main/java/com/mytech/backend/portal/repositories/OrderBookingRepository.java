package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.OrderBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderBookingRepository extends JpaRepository<OrderBooking, Long> {
}