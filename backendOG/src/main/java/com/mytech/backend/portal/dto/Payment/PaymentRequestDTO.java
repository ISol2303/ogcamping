package com.mytech.backend.portal.dto.Payment;

import com.mytech.backend.portal.models.Payment.PaymentMethod;
import  lombok.*;
@Data
public class PaymentRequestDTO {
    private Long bookingId;
    private PaymentMethod method;
	public Long getBookingId() {
		return bookingId;
	}
	public void setBookingId(Long bookingId) {
		this.bookingId = bookingId;
	}
	public PaymentMethod getMethod() {
		return method;
	}
	public void setMethod(PaymentMethod method) {
		this.method = method;
	}
    
}
