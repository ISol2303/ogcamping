package com.mytech.backend.portal.services;

import com.mytech.backend.portal.dto.BookingDTO;
import java.util.List;

public interface BookingService {
    List<BookingDTO> getBookings();
    BookingDTO getBookingById(Long id);
    BookingDTO createBooking(BookingDTO bookingDTO);
    BookingDTO updateBooking(Long id, BookingDTO bookingDTO);
    void deleteBooking(Long id);
}
