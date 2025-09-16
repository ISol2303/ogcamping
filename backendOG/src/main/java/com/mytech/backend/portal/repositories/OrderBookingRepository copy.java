package com.mytech.backend.portal.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mytech.backend.portal.models.OrderBooking;

@Repository
public interface OrderBookingRepository extends JpaRepository<OrderBooking, Long> {
	List<OrderBooking> findByEmail(String email);
	OrderBooking findByOrderCode(String orderCode);
	boolean existsByOrderCode(String orderCode);
	Optional<OrderBooking> findByIdAndStatus(Long id, String status);
	List<OrderBooking> findByStatus(String string);
	@Modifying
    @Query("UPDATE OrderBooking o SET o.status = :status, o.confirmedAt = :confirmedAt WHERE o.status = 'PENDING'")
    int updateStatusForPendingOrders(@Param("status") String status, @Param("confirmedAt") LocalDateTime confirmedAt);
	 List<OrderBooking> findByEmailSentAtIsNull();
	 List<OrderBooking> findByCustomerName(String customerName);
	 

}

