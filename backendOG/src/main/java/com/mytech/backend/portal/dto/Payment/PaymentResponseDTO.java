package com.mytech.backend.portal.dto.Payment;

import com.mytech.backend.portal.models.Payment.PaymentMethod;
import com.mytech.backend.portal.models.Payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponseDTO {
    private Long id;
    private Long bookingId;
    private PaymentMethod method;         // enum
    private PaymentStatus status;                // PENDING / PAID / FAILED
    private Double amount;
    private String providerTransactionId;
    private String paymentUrl;            // URL redirect VNPay
    private LocalDateTime createdAt;
}

