package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Booking.BookingGetByServiceDTO;
import com.mytech.backend.portal.dto.Booking.BookingRequestDTO;
import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.dto.Booking.BookingStatsDTO;
import com.mytech.backend.portal.dto.Rating.ReviewRequestDTO;
import com.mytech.backend.portal.dto.Shift.AssignBookingRequest;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.BookingItemRepository;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.ComboRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import com.mytech.backend.portal.services.Booking.BookingService;
import com.mytech.backend.portal.services.Shift.ShiftService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/apis/v1/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final ComboRepository comboRepository;
    private final BookingItemRepository bookingItemRepository;
    private final ShiftService shiftService; // dùng method assignBookingManually
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }
    @PostMapping
    public ResponseEntity<BookingResponseDTO> placeBooking(
            @RequestParam(name = "customerId") Long customerId,
            @RequestBody BookingRequestDTO req) {
        return ResponseEntity.ok(bookingService.placeBooking(customerId, req));
    }


    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBooking(@PathVariable("id") Long id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }


    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingResponseDTO>> getCustomerBookings(
            @PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(bookingService.getBookingsByCustomer(customerId));
    }


    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<BookingResponseDTO> reviewBooking(
            @PathVariable Long id,
            @RequestBody ReviewRequestDTO req) {
        return ResponseEntity.ok(bookingService.reviewBooking(id, req));
    }

    @GetMapping("/{comboId}/confirmed-count")
    public ResponseEntity<Long> getConfirmedBookingCount(@PathVariable("comboId") Long comboId) {
        long count = bookingService.getConfirmedBookingsForCombo(comboId);
        return ResponseEntity.ok(count);
    }
    @GetMapping("/{comboId}/revenue")
    public ResponseEntity<Map<String, Long>> getRevenue(@PathVariable("comboId") Long comboId) {
        long totalRevenue = bookingService.getRevenueByCombo(comboId);
        long monthlyRevenue = bookingService.getMonthlyRevenueByCombo(comboId);

        Map<String, Long> result = new HashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("monthlyRevenue", monthlyRevenue);

        return ResponseEntity.ok(result);
    }
    @GetMapping("/{comboId}/savings")
    public ResponseEntity<Map<String, Object>> getTotalSavings(@PathVariable("comboId") Long comboId) {
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        long confirmedCount = bookingItemRepository.countByComboIdAndBookingStatus(
                comboId,
                BookingStatus.CONFIRMED
        );

        BigDecimal savingPerBooking = (combo.getOriginalPrice() != null && combo.getPrice() != null)
                ? BigDecimal.valueOf(combo.getOriginalPrice()).subtract(BigDecimal.valueOf(combo.getPrice()))
                : BigDecimal.ZERO;

        BigDecimal totalSavings = bookingService.getTotalSavings(comboId);

        Map<String, Object> response = new HashMap<>();
        response.put("comboId", comboId);
        response.put("confirmedBookings", confirmedCount);
        response.put("savingPerBooking", savingPerBooking);
        response.put("totalSavings", totalSavings);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/countAllBookingsByAllCombo")
    public ResponseEntity<Long> getTotalConfirmedComboBookings() {
        long total = bookingService.getTotalConfirmedBookingsFromAllCombos();
        return ResponseEntity.ok(total);
    }
    // Lấy tất cả booking đã đặt service
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<BookingGetByServiceDTO>> getBookingsByService(@PathVariable Long serviceId) {
        List<BookingGetByServiceDTO> bookings = bookingService.getBookingsByService(serviceId);
        return ResponseEntity.ok(bookings);
    }
    @GetMapping("/services/{serviceId}")
    public ResponseEntity<BookingStatsDTO> getStats(@PathVariable Long serviceId) {
        return ResponseEntity.ok(bookingService.getStatsByService(serviceId));
    }

    // Cập nhật trạng thái booking
    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable("id") Long bookingId,
            @RequestParam("status") BookingStatus status) {

        BookingResponseDTO updated = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(updated);
    }

    // Cập nhật ghi chú nội bộ
    @PutMapping("/{id}/internal-notes")
    public ResponseEntity<BookingResponseDTO> updateInternalNotes(
            @PathVariable("id") Long bookingId,
            @RequestBody String notes) {

        BookingResponseDTO updated = bookingService.updateInternalNotes(bookingId, notes);
        return ResponseEntity.ok(updated);
    }
    @PutMapping("/{id}/checkin")
    public ResponseEntity<BookingResponseDTO> confirmCheckIn(@PathVariable Long id) {
        Booking booking = bookingService.confirmCheckIn(id);
        return ResponseEntity.ok(bookingService.mapToDTO(booking));
    }

    @PutMapping("/{id}/checkout")
    public ResponseEntity<BookingResponseDTO> confirmCheckOut(@PathVariable Long id) {
        Booking booking = bookingService.confirmCheckOut(id);
        return ResponseEntity.ok(bookingService.mapToDTO(booking));
    }
    // Admin gán nhân viên cho booking
    @PutMapping("/{bookingId}/assign")
    @Transactional
    public ResponseEntity<?> assignBooking(@PathVariable Long bookingId, @RequestBody AssignBookingRequest req) {
        // sử dụng ShiftService.assignBookingManually
        Booking updated = shiftService.assignBookingManually(bookingId, req.getStaffId());
        return ResponseEntity.ok(updated);
    }

    // Lấy booking theo nhân viên
    @GetMapping("/by-staff/{staffId}")
    public ResponseEntity<List<Booking>> getBookingsByStaff(@PathVariable Long staffId) {
        User staff = userRepository.findById(staffId).orElseThrow(() -> new RuntimeException("Staff not found"));
        List<Booking> list = bookingRepository.findByAssignedStaff(staff);
        return ResponseEntity.ok(list);
    }

}