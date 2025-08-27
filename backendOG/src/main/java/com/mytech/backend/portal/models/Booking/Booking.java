package com.mytech.backend.portal.models.Booking;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Payment.Payment;
import com.mytech.backend.portal.models.Service.Service;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

	private LocalDateTime checkInDate;
	private LocalDateTime checkOutDate;
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

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Customer getCustomer() {
		return customer;
	}

	public void setCustomer(Customer customer) {
		this.customer = customer;
	}

	public Service getService() {
		return service;
	}

	public void setService(Service service) {
		this.service = service;
	}

	public Combo getCombo() {
		return combo;
	}

	public void setCombo(Combo combo) {
		this.combo = combo;
	}

	public LocalDateTime getCheckInDate() {
		return checkInDate;
	}

	public void setCheckInDate(LocalDateTime localDateTime) {
		this.checkInDate = localDateTime;
	}

	public LocalDateTime getCheckOutDate() {
		return checkOutDate;
	}

	public void setCheckOutDate(LocalDateTime checkOutDate) {
		this.checkOutDate = checkOutDate;
	}

	public Integer getNumberOfPeople() {
		return numberOfPeople;
	}

	public void setNumberOfPeople(Integer numberOfPeople) {
		this.numberOfPeople = numberOfPeople;
	}

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public Integer getRating() {
		return rating;
	}

	public void setRating(Integer rating) {
		this.rating = rating;
	}

	public String getFeedback() {
		return feedback;
	}

	public void setFeedback(String feedback) {
		this.feedback = feedback;
	}

	public Payment getPayment() {
		return payment;
	}

	public void setPayment(Payment payment) {
		this.payment = payment;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public static class Builder {
        private Long id;
        private Customer customer;
        private Service service;
        private Combo combo;
        private LocalDateTime checkInDate;
        private LocalDateTime checkOutDate;
        private Integer numberOfPeople;
        private BookingStatus status = BookingStatus.PENDING;
        private String note;
        private Integer rating;
        private String feedback;
        private Payment payment;
        private LocalDateTime createdAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder customer(Customer customer) {
            this.customer = customer;
            return this;
        }

        public Builder service(Service service) {
            this.service = service;
            return this;
        }

        public Builder combo(Combo combo) {
            this.combo = combo;
            return this;
        }

        public Builder checkInDate(LocalDateTime checkInDate) {
            this.checkInDate = checkInDate;
            return this;
        }

        public Builder checkOutDate(LocalDateTime checkOutDate) {
            this.checkOutDate = checkOutDate;
            return this;
        }

        public Builder numberOfPeople(Integer numberOfPeople) {
            this.numberOfPeople = numberOfPeople;
            return this;
        }

        public Builder status(BookingStatus status) {
            this.status = status;
            return this;
        }

        public Builder note(String note) {
            this.note = note;
            return this;
        }

        public Builder rating(Integer rating) {
            this.rating = rating;
            return this;
        }

        public Builder feedback(String feedback) {
            this.feedback = feedback;
            return this;
        }

        public Builder payment(Payment payment) {
            this.payment = payment;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Booking build() {
            Booking booking = new Booking();
            booking.id = this.id;
            booking.customer = this.customer;
            booking.service = this.service;
            booking.combo = this.combo;
            booking.checkInDate = this.checkInDate;
            booking.checkOutDate = this.checkOutDate;
            booking.numberOfPeople = this.numberOfPeople;
            booking.status = this.status != null ? this.status : BookingStatus.PENDING;
            booking.note = this.note;
            booking.rating = this.rating;
            booking.feedback = this.feedback;
            booking.payment = this.payment;
            booking.createdAt = this.createdAt != null ? this.createdAt : LocalDateTime.now();
            return booking;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
	
}
