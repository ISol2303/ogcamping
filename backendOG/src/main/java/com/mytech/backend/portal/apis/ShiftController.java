package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.dto.Shift.ShiftResponseDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Shift.Shift;
import com.mytech.backend.portal.services.Booking.BookingService;
import com.mytech.backend.portal.services.Shift.ShiftService;
import com.mytech.backend.portal.services.Shift.ShiftServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/apis/v1/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;
    private final BookingService bookingService;

    // Đăng ký ca trực
    @PostMapping("/register")
    public ResponseEntity<ShiftResponseDTO> registerShift(
            @RequestParam Long staffId,
            @RequestParam LocalDate date,
            @RequestParam LocalTime start,
            @RequestParam LocalTime end
    ) {
        Shift shift = shiftService.registerShift(staffId, date, start, end);
        return ResponseEntity.ok(((ShiftServiceImpl) shiftService).toDTO(shift));
    }


    // Duyệt ca trực
    @PutMapping("/{shiftId}/approve")
    public ResponseEntity<ShiftResponseDTO> approveShift(@PathVariable Long shiftId) {
        Shift shift = shiftService.approveShift(shiftId);
        return ResponseEntity.ok(shiftService.toDTO(shift));
    }


    // Bắt đầu ca trực
    @PutMapping("/{shiftId}/start")
    public ResponseEntity<ShiftResponseDTO> startShift(@PathVariable Long shiftId) {
        Shift shift = shiftService.startShift(shiftId);
        return ResponseEntity.ok(shiftService.toDTO(shift));

    }

    // Kết thúc ca trực
    @PutMapping("/{shiftId}/complete")
    public ResponseEntity<ShiftResponseDTO> completeShift(@PathVariable Long shiftId) {
        Shift shift = shiftService.completeShift(shiftId);
        return ResponseEntity.ok(shiftService.toDTO(shift));

    }

    // Hủy ca trực
    @PutMapping("/{shiftId}/cancel")
    public ResponseEntity<ShiftResponseDTO> cancelShift(@PathVariable Long shiftId) {
        Shift shift = shiftService.cancelShift(shiftId);
        return ResponseEntity.ok(shiftService.toDTO(shift));

    }

    // Gán booking cho nhân viên thủ công
    @PutMapping("/assign/manual")
    public ResponseEntity<BookingResponseDTO> assignBookingManually(
            @RequestParam Long bookingId,
            @RequestParam Long staffId) {
        Booking booking = shiftService.assignBookingManually(bookingId, staffId);
        return ResponseEntity.ok(bookingService.mapToDTO(booking));
    }

    // Gán booking cho nhân viên tự động
    @PutMapping("/assign/auto")
    public ResponseEntity<BookingResponseDTO> assignBookingAutomatically(@RequestParam Long bookingId) {
        Booking booking = shiftService.assignBookingAutomatically(bookingId);
        return ResponseEntity.ok(bookingService.mapToDTO(booking));
    }
}
