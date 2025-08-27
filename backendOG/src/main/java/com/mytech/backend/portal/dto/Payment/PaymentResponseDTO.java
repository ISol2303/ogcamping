package com.mytech.backend.portal.dto.Payment;
import com.mytech.backend.portal.models.Payment.PaymentMethod;
import com.mytech.backend.portal.models.Payment.PaymentStatus;
import lombok.*;

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
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
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
	public PaymentStatus getStatus() {
		return status;
	}
	public void setStatus(PaymentStatus status) {
		this.status = status;
	}
	public Double getAmount() {
		return amount;
	}
	public void setAmount(Double amount) {
		this.amount = amount;
	}
	public String getProviderTransactionId() {
		return providerTransactionId;
	}
	public void setProviderTransactionId(String providerTransactionId) {
		this.providerTransactionId = providerTransactionId;
	}
	public String getPaymentUrl() {
		return paymentUrl;
	}
	public void setPaymentUrl(String paymentUrl) {
		this.paymentUrl = paymentUrl;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public static class Builder {
        private Long id;
        private Long bookingId;
        private PaymentMethod method;
        private PaymentStatus status;
        private Double amount;
        private String providerTransactionId;
        private String paymentUrl;
        private LocalDateTime createdAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder bookingId(Long bookingId) {
            this.bookingId = bookingId;
            return this;
        }

        public Builder method(PaymentMethod method) {
            this.method = method;
            return this;
        }

        public Builder status(PaymentStatus status) {
            this.status = status;
            return this;
        }

        public Builder amount(Double amount) {
            this.amount = amount;
            return this;
        }

        public Builder providerTransactionId(String providerTransactionId) {
            this.providerTransactionId = providerTransactionId;
            return this;
        }

        public Builder paymentUrl(String paymentUrl) {
            this.paymentUrl = paymentUrl;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PaymentResponseDTO build() {
            PaymentResponseDTO paymentResponseDTO = new PaymentResponseDTO();
            paymentResponseDTO.id = this.id;
            paymentResponseDTO.bookingId = this.bookingId;
            paymentResponseDTO.method = this.method;
            paymentResponseDTO.status = this.status;
            paymentResponseDTO.amount = this.amount;
            paymentResponseDTO.providerTransactionId = this.providerTransactionId;
            paymentResponseDTO.paymentUrl = this.paymentUrl;
            paymentResponseDTO.createdAt = this.createdAt;
            return paymentResponseDTO;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

