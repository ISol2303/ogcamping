package com.mytech.backend.portal.services;

import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.models.Booking.Booking;

public interface EmailService {
    void sendOrderConfirmation(String to, String subject, String body);
    void sendBookingEmail(OrderBooking order);
    void sendResetPasswordCode(String to, String subject, String body);
    void sendBookingEmail(Booking booking);
    void sendBookingConfirmationEmail(Booking booking);
   
}
