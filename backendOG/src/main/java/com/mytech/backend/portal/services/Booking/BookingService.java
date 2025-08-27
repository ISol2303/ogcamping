package com.mytech.backend.portal.services.Booking;

import java.util.List;

import com.mytech.backend.portal.dto.Booking.BookingRequestDTO;
import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.dto.Rating.ReviewRequestDTO;

public interface BookingService {
    BookingResponseDTO placeBooking(Long customerId, BookingRequestDTO req);
    BookingResponseDTO getBooking(Long id);
    List<BookingResponseDTO> getBookingsByCustomer(Long customerId);
    BookingResponseDTO cancelBooking(Long bookingId);
    BookingResponseDTO reviewBooking(Long bookingId, ReviewRequestDTO req);
	BookingResponseDTO checkInBooking(Long id);
	BookingResponseDTO checkOutBooking(Long id);
}
