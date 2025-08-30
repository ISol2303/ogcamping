package com.mytech.backend.portal.services;

import com.mytech.backend.portal.models.OrderBooking;

public interface InvoiceService {
	byte[] generateInvoicePDF(OrderBooking order);
//    byte[] generateInvoicePDF(Long orderId);
}

