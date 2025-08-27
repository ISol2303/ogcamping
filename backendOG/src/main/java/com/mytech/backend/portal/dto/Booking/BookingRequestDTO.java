package com.mytech.backend.portal.dto.Booking;
import com.mytech.backend.portal.models.Payment.PaymentMethod;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingRequestDTO {
    private Long serviceId;
    private Long comboId;
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private Integer numberOfPeople;
    private String note;
	public Long getServiceId() {
		return serviceId;
	}
	public void setServiceId(Long serviceId) {
		this.serviceId = serviceId;
	}
	public Long getComboId() {
		return comboId;
	}
	public void setComboId(Long comboId) {
		this.comboId = comboId;
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
	public String getNote() {
		return note;
	}
	public void setNote(String note) {
		this.note = note;
	}
    
}
