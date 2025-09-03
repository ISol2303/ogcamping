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
<<<<<<< HEAD
=======
import java.util.Optional;
>>>>>>> 4b112d9 (Add or update frontend & backend code)

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);
<<<<<<< HEAD
=======
//    Optional<Booking> findByCustomerIdAndServiceIdAndCheckInDate(
//            Long customerId,
//            Long serviceId,
//            LocalDate checkInDate
//    );
>>>>>>> 4b112d9 (Add or update frontend & backend code)
}