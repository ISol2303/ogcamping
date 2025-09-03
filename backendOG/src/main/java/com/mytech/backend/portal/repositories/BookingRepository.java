package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Booking.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);
//    Optional<Booking> findByCustomerIdAndServiceIdAndCheckInDate(
//            Long customerId,
//            Long serviceId,
//            LocalDate checkInDate
//    );
}