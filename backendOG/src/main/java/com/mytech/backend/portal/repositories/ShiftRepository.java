package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Shift.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    // Lấy tất cả ca trực mà user tham gia
    @Query("SELECT s FROM Shift s JOIN s.assignments a WHERE a.user.id = :userId")
    List<Shift> findByUserId(@Param("userId") Long userId);

    // Tìm ca trực theo ngày + khoảng giờ
    List<Shift> findByShiftDateAndStartTimeBetween(LocalDate date, LocalTime start, LocalTime end);

    // Tìm ca trực trong 1 ngày của 1 user
    @Query("SELECT s FROM Shift s JOIN s.assignments a WHERE s.shiftDate = :date AND a.user.id = :userId")
    List<Shift> findByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    // Tìm ca trực đang active (IN_PROGRESS)
    @Query("SELECT s FROM Shift s JOIN s.assignments a WHERE a.user.id = :userId AND s.status = 'IN_PROGRESS'")
    List<Shift> findActiveShiftByUser(@Param("userId") Long userId);
}

