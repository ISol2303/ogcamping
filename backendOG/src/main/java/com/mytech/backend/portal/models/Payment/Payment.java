package com.mytech.backend.portal.models.Payment;

import com.mytech.backend.portal.models.Booking.Booking;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


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
}
