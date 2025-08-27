package com.mytech.backend.portal.services;

import com.mytech.backend.portal.models.OrderBooking;

public interface EmailService {
    void sendOrderConfirmation(String to, String subject, String body);
    void sendBookingEmail(OrderBooking order);
}
