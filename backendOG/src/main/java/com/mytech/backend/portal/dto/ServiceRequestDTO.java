package com.mytech.backend.portal.dto;


import java.util.List;

import com.mytech.backend.portal.models.ServiceTag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestDTO {
    private String name;
    private String description;
    private Double price;
    private String location;
    private Integer minDays;
    private Integer maxDays;
    private Integer minCapacity;
    private Integer maxCapacity;
    private Integer availableSlots;
    private String duration;       // VD: "2-3 ngày"
    private String capacity;       // VD: "4-6 người"
    private ServiceTag tag;            // POPULAR / NEW / DISCOUNT
    private List<String> highlights; // danh sách điểm nổi bật
    private List<String> included;   // danh sách dịch vụ bao gồm
    private List<ItineraryDTO> itinerary; // lịch trình
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public Double getPrice() {
		return price;
	}
	public void setPrice(Double price) {
		this.price = price;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public Integer getMinDays() {
		return minDays;
	}
	public void setMinDays(Integer minDays) {
		this.minDays = minDays;
	}
	public Integer getMaxDays() {
		return maxDays;
	}
	public void setMaxDays(Integer maxDays) {
		this.maxDays = maxDays;
	}
	public Integer getMinCapacity() {
		return minCapacity;
	}
	public void setMinCapacity(Integer minCapacity) {
		this.minCapacity = minCapacity;
	}
	public Integer getMaxCapacity() {
		return maxCapacity;
	}
	public void setMaxCapacity(Integer maxCapacity) {
		this.maxCapacity = maxCapacity;
	}
	public Integer getAvailableSlots() {
		return availableSlots;
	}
	public void setAvailableSlots(Integer availableSlots) {
		this.availableSlots = availableSlots;
	}
	public String getDuration() {
		return duration;
	}
	public void setDuration(String duration) {
		this.duration = duration;
	}
	public String getCapacity() {
		return capacity;
	}
	public void setCapacity(String capacity) {
		this.capacity = capacity;
	}
	public ServiceTag getTag() {
		return tag;
	}
	public void setTag(ServiceTag tag) {
		this.tag = tag;
	}
	public List<String> getHighlights() {
		return highlights;
	}
	public void setHighlights(List<String> highlights) {
		this.highlights = highlights;
	}
	public List<String> getIncluded() {
		return included;
	}
	public void setIncluded(List<String> included) {
		this.included = included;
	}
	public List<ItineraryDTO> getItinerary() {
		return itinerary;
	}
	public void setItinerary(List<ItineraryDTO> itinerary) {
		this.itinerary = itinerary;
	}
    
}

