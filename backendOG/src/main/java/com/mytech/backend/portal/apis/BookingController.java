package com.mytech.backend.portal.apis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.dto.BookingRequestDTO;
import com.mytech.backend.portal.dto.BookingResponseDTO;
import com.mytech.backend.portal.services.BookingService;

@RestController
@RequestMapping("/apis/v1/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // Lấy tất cả booking của 1 customer
    @GetMapping("/customer/{customerId}")
    public List<BookingResponseDTO> getBookingsByCustomer(@PathVariable Long customerId) {
        return bookingService.getBookingsByCustomer(customerId);
    }

    // Lấy booking theo id
    @GetMapping("/{id}")
    public BookingResponseDTO getBookingById(@PathVariable Long id) {
        return bookingService.getBooking(id);
    }

    // Tạo booking (cần truyền customerId + request)
    @PostMapping("/{customerId}")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @PathVariable Long customerId,
            @RequestBody BookingRequestDTO bookingRequest) {
        return ResponseEntity.ok(bookingService.placeBooking(customerId, bookingRequest));
    }

    // Hủy booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    // Check-in
    @PutMapping("/{id}/checkin")
    public ResponseEntity<BookingResponseDTO> checkInBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkInBooking(id));
    }

    // Check-out
    @PutMapping("/{id}/checkout")
    public ResponseEntity<BookingResponseDTO> checkOutBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkOutBooking(id));
    }

    // Xóa booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id); // hoặc tạo method deleteBooking trong serviceImpl
        return ResponseEntity.noContent().build();
    }
}
