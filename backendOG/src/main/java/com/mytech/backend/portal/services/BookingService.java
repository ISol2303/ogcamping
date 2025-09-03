package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.BookingRequestDTO;
import com.mytech.backend.portal.dto.BookingResponseDTO;
import com.mytech.backend.portal.dto.ReviewRequestDTO;

public interface BookingService {
    BookingResponseDTO placeBooking(Long customerId, BookingRequestDTO req);
    BookingResponseDTO getBooking(Long id);
    List<BookingResponseDTO> getBookingsByCustomer(Long customerId);
    BookingResponseDTO cancelBooking(Long bookingId);
    BookingResponseDTO reviewBooking(Long bookingId, ReviewRequestDTO req);
	BookingResponseDTO checkInBooking(Long id);
	BookingResponseDTO checkOutBooking(Long id);
	List<BookingResponseDTO> getAllBookings();
}
