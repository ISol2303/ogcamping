package com.mytech.backend.portal.dto;

import java.time.LocalDateTime;

import com.mytech.backend.portal.models.BookingStatus;

import lombok.Data;

@Data
public class BookingResponseDTO {
    private Long id;
    private Long customerId;
    private String serviceName;
    private String comboName;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private Integer numberOfPeople;
    private BookingStatus status;
    private PaymentResponseDTO payment;
    private String note;
    public BookingResponseDTO(){}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getCustomerId() {
		return customerId;
	}
	public void setCustomerId(Long customerId) {
		this.customerId = customerId;
	}
	public String getServiceName() {
		return serviceName;
	}
	public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
	}
	public String getComboName() {
		return comboName;
	}
	public void setComboName(String comboName) {
		this.comboName = comboName;
	}
	public LocalDateTime getCheckInDate() {
		return checkInDate;
	}
	public void setCheckInDate(LocalDateTime checkInDate) {
		this.checkInDate = checkInDate;
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
	public PaymentResponseDTO getPayment() {
		return payment;
	}
	public void setPayment(PaymentResponseDTO payment) {
		this.payment = payment;
	}
	public String getNote() {
		return note;
	}
	public void setNote(String note) {
		this.note = note;
	}

    public static class Builder {
        private Long id;
        private Long customerId;
        private String serviceName;
        private String comboName;
        private LocalDateTime checkInDate;
        private LocalDateTime checkOutDate;
        private Integer numberOfPeople;
        private BookingStatus status;
        private PaymentResponseDTO payment;
        private String note;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder customerId(Long customerId) {
            this.customerId = customerId;
            return this;
        }

        public Builder serviceName(String serviceName) {
            this.serviceName = serviceName;
            return this;
        }

        public Builder comboName(String comboName) {
            this.comboName = comboName;
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

        public Builder payment(PaymentResponseDTO payment) {
            this.payment = payment;
            return this;
        }

        public Builder note(String note) {
            this.note = note;
            return this;
        }

        public BookingResponseDTO build() {
            BookingResponseDTO bookingResponseDTO = new BookingResponseDTO();
            bookingResponseDTO.id = this.id;
            bookingResponseDTO.customerId = this.customerId;
            bookingResponseDTO.serviceName = this.serviceName;
            bookingResponseDTO.comboName = this.comboName;
            bookingResponseDTO.checkInDate = this.checkInDate;
            bookingResponseDTO.checkOutDate = this.checkOutDate;
            bookingResponseDTO.numberOfPeople = this.numberOfPeople;
            bookingResponseDTO.status = this.status;
            bookingResponseDTO.payment = this.payment;
            bookingResponseDTO.note = this.note;
            return bookingResponseDTO;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

}