package com.mytech.backend.portal.services;

import com.mytech.backend.portal.dto.PaymentRequestDTO;
import com.mytech.backend.portal.dto.PaymentResponseDTO;

public interface PaymentService {
    PaymentResponseDTO createPayment(PaymentRequestDTO req);
    PaymentResponseDTO confirmPaymentVNPay(String txnRef, boolean success);
    String generateVNPayUrl(Long bookingId);
    PaymentResponseDTO findByTransactionId(String txnId);
    
}


