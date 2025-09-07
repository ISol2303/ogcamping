package com.mytech.backend.portal.dto.Payment;

import com.mytech.backend.portal.models.Payment.PaymentMethod;
import  lombok.*;
@Data
public class PaymentRequestDTO {
    private Long bookingId;
    private PaymentMethod method;
}
