package com.mytech.backend.portal.apis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.dto.Booking.BookingRequestDTO;
import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.dto.Rating.ReviewRequestDTO;
import com.mytech.backend.portal.services.Booking.BookingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/apis/v1/bookings")
@RequiredArgsConstructor
public class BookingController {
	@Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponseDTO> placeBooking(
            @RequestParam(name = "customerId") Long customerId,
            @RequestBody BookingRequestDTO req) {
        return ResponseEntity.ok(bookingService.placeBooking(customerId, req));
    }



    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingResponseDTO>> getCustomerBookings(@PathVariable Long customerId) {
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
}