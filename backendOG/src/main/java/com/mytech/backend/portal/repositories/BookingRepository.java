package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.User.User;

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

    // 🔹 Lấy tất cả booking theo customer
    List<Booking> findByCustomerId(Long customerId);

    // 🔹 Lấy tất cả booking theo staff
    List<Booking> findByAssignedStaff(User staff);

    // 🔹 Đếm số booking theo staff
    int countByAssignedStaff(User staff);

    // 🔹 Phân trang toàn bộ booking
    Page<Booking> findAll(Pageable pageable);

    // 🔹 Phân trang theo status
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    // 🔹 Phân trang theo customer
    Page<Booking> findByCustomerId(Long customerId, Pageable pageable);

    // 🔹 Phân trang theo staff
    Page<Booking> findByAssignedStaff(User staff, Pageable pageable);

    // 🔹 Tìm booking theo customer, service và ngày check-in (tránh trùng lịch)
    @Query("SELECT b FROM Booking b JOIN b.items i WHERE b.customer.id = :customerId " +
           "AND i.service.id = :serviceId " +
           "AND DATE(b.checkInDate) = :checkInDate")
    Optional<Booking> findByCustomerIdAndServiceIdAndCheckInDate(
            @Param("customerId") Long customerId,
            @Param("serviceId") Long serviceId,
            @Param("checkInDate") LocalDate checkInDate
    );

    // 🔹 Lấy tất cả booking trong khoảng thời gian (để check phòng/dịch vụ còn trống)
    @Query("SELECT b FROM Booking b WHERE b.checkInDate <= :endDate AND b.checkOutDate >= :startDate")
    List<Booking> findBookingsBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 🔹 Tìm các booking chưa gửi email
    List<Booking> findByEmailSentAtIsNull();

    // 🔹 Lấy booking với customer (cho PDF generation)
    @Query("SELECT b FROM Booking b JOIN FETCH b.customer WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithCustomer(@Param("bookingId") Long bookingId);
}
