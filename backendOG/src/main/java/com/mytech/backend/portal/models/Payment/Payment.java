package com.mytech.backend.portal.models.Payment;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.mytech.backend.portal.models.Booking.Booking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Liên kết 1-1 với Booking
	@OneToOne
	@JoinColumn(name = "booking_id", nullable = false, unique = true)
	private Booking booking;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private PaymentMethod method;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private PaymentStatus status = PaymentStatus.PENDING;

	@Column(nullable = false)
	private Double amount;

	@Column(nullable = false, unique = true)
	private String providerTransactionId; // mã giao dịch VNPay/Momo/PayPal

	@Column
	private String failureReason;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Booking getBooking() {
		return booking;
	}

	public void setBooking(Booking booking) {
		this.booking = booking;
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

	public String getFailureReason() {
		return failureReason;
	}

	public void setFailureReason(String failureReason) {
		this.failureReason = failureReason;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
	public static class Builder {
        private Long id;
        private Booking booking;
        private PaymentMethod method;
        private PaymentStatus status;
        private Double amount;
        private String providerTransactionId;
        private String failureReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder booking(Booking booking) {
            this.booking = booking;
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

        public Builder failureReason(String failureReason) {
            this.failureReason = failureReason;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Payment build() {
            Payment payment = new Payment();
            payment.id = this.id;
            payment.booking = this.booking;
            payment.method = this.method;
            payment.status = this.status != null ? this.status : PaymentStatus.PENDING;
            payment.amount = this.amount;
            payment.providerTransactionId = this.providerTransactionId;
            payment.failureReason = this.failureReason;
            payment.createdAt = this.createdAt != null ? this.createdAt : LocalDateTime.now();
            payment.updatedAt = this.updatedAt;
            return payment;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
