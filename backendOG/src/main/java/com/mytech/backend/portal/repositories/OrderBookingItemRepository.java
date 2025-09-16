package com.mytech.backend.portal.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.models.OrderBookingItem;

@Repository
public interface OrderBookingItemRepository extends JpaRepository<OrderBookingItem, Long> {
    List<OrderBookingItem> findByOrderBooking(OrderBooking orderBooking);
}
