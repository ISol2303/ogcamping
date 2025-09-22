package com.mytech.backend.portal.services.Shift;

import com.mytech.backend.portal.dto.Shift.ShiftResponseDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Shift.Shift;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ShiftService {
    // Quản lý ca trực
    List<ShiftResponseDTO> getAllShifts();
    Shift registerShift(Long staffId, LocalDate date, LocalTime start, LocalTime end);
    Shift approveShift(Long shiftId);
    Shift startShift(Long shiftId);
    Shift completeShift(Long shiftId);
    Shift cancelShift(Long shiftId);

    // Gán booking cho nhân viên
    Booking assignBookingManually(Long bookingId, Long staffId);
    Booking assignBookingAutomatically(Long bookingId);
    // Thêm mới để convert sang DTO
    ShiftResponseDTO toDTO(Shift shift);
}

