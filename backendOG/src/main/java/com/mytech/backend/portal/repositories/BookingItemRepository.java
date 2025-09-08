package com.mytech.backend.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mytech.backend.portal.models.Booking.BookingItem;
import com.mytech.backend.portal.models.Booking.BookingStatus;

public interface BookingItemRepository extends JpaRepository<BookingItem, Long> {

    @Query("SELECT COUNT(bi) FROM BookingItem bi " +
            "WHERE bi.combo.id = :comboId AND bi.booking.status = :status")
    long countByComboAndBookingStatus(@Param("comboId") Long comboId,
                                      @Param("status") BookingStatus status);

    // Tổng tiền của 1 combo theo booking đã confirmed
    @Query("SELECT COALESCE(SUM(bi.price * bi.quantity), 0) " +
            "FROM BookingItem bi " +
            "JOIN bi.booking b " +
            "WHERE bi.combo.id = :comboId AND b.status = :status")
    long getTotalRevenueByComboAndStatus(@Param("comboId") Long comboId,
                                         @Param("status") BookingStatus status);

    // Tổng tiền trong tháng hiện tại
    @Query("SELECT COALESCE(SUM(bi.price * bi.quantity), 0) " +
            "FROM BookingItem bi " +
            "JOIN bi.booking b " +
            "WHERE bi.combo.id = :comboId " +
            "AND b.status = :status " +
            "AND MONTH(b.createdAt) = MONTH(CURRENT_DATE) " +
            "AND YEAR(b.createdAt) = YEAR(CURRENT_DATE)")
    long getMonthlyRevenueByComboAndStatus(@Param("comboId") Long comboId,
                                           @Param("status") BookingStatus status);

    @Query("SELECT COUNT(bi) " +
            "FROM BookingItem bi " +
            "WHERE bi.combo.id = :comboId " +
            "AND bi.booking.status = :status")
    long countByComboIdAndBookingStatus(@Param("comboId") Long comboId,
                                        @Param("status") BookingStatus status);

    @Query("SELECT COUNT(DISTINCT bi.booking.id) " +
            "FROM BookingItem bi " +
            "WHERE bi.type = 'COMBO' " +
            "AND bi.booking.status = com.mytech.backend.portal.models.Booking.BookingStatus.CONFIRMED")
    long countAllConfirmedComboBookings();
}