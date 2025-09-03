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
<<<<<<< HEAD
=======
import java.util.ArrayList;
import java.util.List;
>>>>>>> 4b112d9 (Add or update frontend & backend code)

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

<<<<<<< HEAD
	@ManyToOne
	@JoinColumn(name = "service_id", nullable = false)
	private Service service;

	@ManyToOne @JoinColumn(name="combo_id")
	private Combo combo;  // null nếu là booking 1 service đơn
=======
>>>>>>> 4b112d9 (Add or update frontend & backend code)

	private LocalDate checkInDate;
	private LocalDate checkOutDate;
	private Integer numberOfPeople;

	@Enumerated(EnumType.STRING)
	private BookingStatus status = BookingStatus.PENDING;

	private String note;
	private Integer rating; //1-5
	private String feedback;

<<<<<<< HEAD
=======
	@Column(name = "total_price")
	private Long totalPrice; // ✅ lưu vào DB
>>>>>>> 4b112d9 (Add or update frontend & backend code)

	@OneToOne(mappedBy="booking", cascade=CascadeType.ALL, orphanRemoval=true)
	private Payment payment;

	@CreationTimestamp
	@Column(nullable=false, updatable=false)
	private LocalDateTime createdAt;
<<<<<<< HEAD

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
=======
	@OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<BookingItem> items = new ArrayList<>();


	public Long calculateTotalPrice() {
		long total = 0L;

		for (BookingItem item : items) {
			double base = item.getPrice() * item.getQuantity();

			// Nếu là SERVICE → tính phụ phí extraPeople
			if (item.getService() != null && this.numberOfPeople != null) {
				Service service = item.getService();
				if (this.numberOfPeople > service.getMaxCapacity() && Boolean.TRUE.equals(service.getAllowExtraPeople())) {
					int extra = this.numberOfPeople - service.getMaxCapacity();
					int limitedExtra = Math.min(extra, service.getMaxExtraPeople() != null ? service.getMaxExtraPeople() : extra);
					base += limitedExtra * (service.getExtraFeePerPerson() != null ? service.getExtraFeePerPerson() : 0);
				}
			}

			total += Math.round(base);
		}

		return total;
	}

}

>>>>>>> 4b112d9 (Add or update frontend & backend code)
