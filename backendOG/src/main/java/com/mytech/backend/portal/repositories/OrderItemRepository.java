package com.mytech.backend.portal.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.models.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(OrderBooking order);
    
    

}
