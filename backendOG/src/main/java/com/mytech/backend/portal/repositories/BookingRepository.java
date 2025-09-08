package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Booking.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);


//    Optional<Booking> findByCustomerIdAndServiceIdAndCheckInDate(
//            Long customerId,
//            Long serviceId,
//            LocalDate checkInDate
//    );
}
