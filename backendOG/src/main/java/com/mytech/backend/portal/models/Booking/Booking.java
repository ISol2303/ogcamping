package com.mytech.backend.portal.models.Booking;

import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Payment.Payment;
import com.mytech.backend.portal.models.Service.Service;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "customer_id", nullable = false)
	private Customer customer;

	@ManyToOne
	@JoinColumn(name = "service_id", nullable = false)
	private Service service;

	@ManyToOne @JoinColumn(name="combo_id")
	private Combo combo;  // null nếu là booking 1 service đơn

	private LocalDate checkInDate;
	private LocalDate checkOutDate;
	private Integer numberOfPeople;

	@Enumerated(EnumType.STRING)
	private BookingStatus status = BookingStatus.PENDING;

	private String note;
	private Integer rating; //1-5
	private String feedback;


	@OneToOne(mappedBy="booking", cascade=CascadeType.ALL, orphanRemoval=true)
	private Payment payment;

	@CreationTimestamp
	@Column(nullable=false, updatable=false)
	private LocalDateTime createdAt;

	public Double getTotalPrice() {
		double total = 0.0;

		if (this.getService() != null) {
			total += this.getService().getPrice();
		}

		if (this.getCombo() != null) {
			total += this.getCombo().getPrice();
		}

//		// Nếu có thêm phụ phí / discount / số lượng người
//		if (this.getExtraFee() != null) {
//			total += this.getExtraFee();
//		}
//		if (this.getDiscount() != null) {
//			total -= this.getDiscount();
//		}

		return total;
	}
}
