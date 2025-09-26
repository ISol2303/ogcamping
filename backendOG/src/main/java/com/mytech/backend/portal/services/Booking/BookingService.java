package com.mytech.backend.portal.services.Booking;

import com.mytech.backend.portal.dto.Booking.BookingGetByServiceDTO;
import com.mytech.backend.portal.dto.Booking.BookingRequestDTO;
import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.dto.Booking.BookingStatsDTO;
import com.mytech.backend.portal.dto.BookingDTO;
import com.mytech.backend.portal.dto.Rating.ReviewRequestDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingService {
    List<BookingResponseDTO> getAllBookings();
    BookingResponseDTO placeBooking(Long customerId, BookingRequestDTO req);
    BookingResponseDTO getBooking(Long id);
    List<BookingResponseDTO> getBookingsByCustomer(Long customerId);
    BookingResponseDTO cancelBooking(Long bookingId);
    BookingResponseDTO reviewBooking(Long bookingId, ReviewRequestDTO req);
    //combo
    long getConfirmedBookingsForCombo(Long comboId);
    long getMonthlyRevenueByCombo(Long comboId);
    long getRevenueByCombo(Long comboId);
    BigDecimal getTotalSavings(Long comboId);
    long getTotalConfirmedBookingsFromAllCombos();
    //service
    List<BookingGetByServiceDTO> getBookingsByService(Long serviceId);
    BookingStatsDTO getStatsByService(Long serviceId);

    BookingResponseDTO updateBookingStatus(Long bookingId, BookingStatus status);
    BookingResponseDTO updateInternalNotes(Long bookingId, String notes);
    Booking confirmCheckIn(Long id);
    Booking confirmCheckOut(Long id);
    BookingResponseDTO mapToDTO(Booking booking);
    // void sendBookingConfirmationEmail(BookingResponseDTO bookingDTO);
    BookingResponseDTO confirmBooking(Long id);
    BookingResponseDTO updateEmailSentAt(Long bookingId, LocalDateTime emailSentAt);
}
