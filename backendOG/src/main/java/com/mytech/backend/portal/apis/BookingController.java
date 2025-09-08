package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Booking.BookingRequestDTO;
import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.dto.Rating.ReviewRequestDTO;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.repositories.BookingItemRepository;
import com.mytech.backend.portal.repositories.ComboRepository;
import com.mytech.backend.portal.services.Booking.BookingService;
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

}