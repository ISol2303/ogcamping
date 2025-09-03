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
import java.util.ArrayList;
import java.util.List;

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


	private LocalDate checkInDate;
	private LocalDate checkOutDate;
	private Integer numberOfPeople;

	@Enumerated(EnumType.STRING)
	private BookingStatus status = BookingStatus.PENDING;

	private String note;
	private Integer rating; //1-5
	private String feedback;

	@Column(name = "total_price")
	private Long totalPrice; // ✅ lưu vào DB

	@OneToOne(mappedBy="booking", cascade=CascadeType.ALL, orphanRemoval=true)
	private Payment payment;

	@CreationTimestamp
	@Column(nullable=false, updatable=false)
	private LocalDateTime createdAt;
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

