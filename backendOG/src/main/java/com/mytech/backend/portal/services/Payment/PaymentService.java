package com.mytech.backend.portal.services.Payment;

import com.mytech.backend.portal.dto.Payment.PaymentRequestDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;

import java.util.Map;

public interface PaymentService {
    PaymentResponseDTO createPayment(PaymentRequestDTO req);
    PaymentResponseDTO confirmPaymentVNPay(String txnRef, boolean success);
    String generateVNPayUrl(Long bookingId, String txnRef);
    PaymentResponseDTO findByTransactionId(String txnId);
}


