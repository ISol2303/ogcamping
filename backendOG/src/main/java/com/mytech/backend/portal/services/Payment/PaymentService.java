package com.mytech.backend.portal.services.Payment;

import com.mytech.backend.portal.dto.Payment.PaymentRequestDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;

import java.util.Map;

public interface PaymentService {
    PaymentResponseDTO createPayment(PaymentRequestDTO req);
    PaymentResponseDTO confirmPaymentVNPay(String txnRef, boolean success);
<<<<<<< HEAD
    String generateVNPayUrl(Long bookingId);
=======
    String generateVNPayUrl(Long bookingId, String txnRef);
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    PaymentResponseDTO findByTransactionId(String txnId);
}


