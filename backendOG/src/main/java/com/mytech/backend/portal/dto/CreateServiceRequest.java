package com.mytech.backend.portal.dto;

import java.util.ArrayList;
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
public class CreateServiceRequest {
    private String name;
    private String description;
    private Double price;
    private String location;
    private Integer minDays;
    private Integer maxDays;
    private Integer minCapacity;
    private Integer maxCapacity;
    private Integer availableSlots;
    private String duration;
    private String capacity;
    private ServiceTag tag;
    private String imageUrl;
    private List<String> highlights = new ArrayList<>();
    private List<String> included = new ArrayList<>();
    private List<ItineraryDTO> itinerary = new ArrayList<>();

    public static class Builder {
        private String name;
        private String description;
        private Double price;
        private String location;
        private Integer minDays;
        private Integer maxDays;
        private Integer minCapacity;
        private Integer maxCapacity;
        private Integer availableSlots;
        private String duration;
        private String capacity;
        private ServiceTag tag;
        private String imageUrl;
        private List<String> highlights = new ArrayList<>();
        private List<String> included = new ArrayList<>();
        private List<ItineraryDTO> itinerary = new ArrayList<>();

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder price(Double price) {
            this.price = price;
            return this;
        }

        public Builder location(String location) {
            this.location = location;
            return this;
        }

        public Builder minDays(Integer minDays) {
            this.minDays = minDays;
            return this;
        }

        public Builder maxDays(Integer maxDays) {
            this.maxDays = maxDays;
            return this;
        }

        public Builder minCapacity(Integer minCapacity) {
            this.minCapacity = minCapacity;
            return this;
        }

        public Builder maxCapacity(Integer maxCapacity) {
            this.maxCapacity = maxCapacity;
            return this;
        }

        public Builder availableSlots(Integer availableSlots) {
            this.availableSlots = availableSlots;
            return this;
        }

        public Builder duration(String duration) {
            this.duration = duration;
            return this;
        }

        public Builder capacity(String capacity) {
            this.capacity = capacity;
            return this;
        }

        public Builder tag(ServiceTag tag) {
            this.tag = tag;
            return this;
        }

        public Builder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public Builder highlights(List<String> highlights) {
            this.highlights = highlights != null ? highlights : new ArrayList<>();
            return this;
        }

        public Builder included(List<String> included) {
            this.included = included != null ? included : new ArrayList<>();
            return this;
        }

        public Builder itinerary(List<ItineraryDTO> itinerary) {
            this.itinerary = itinerary != null ? itinerary : new ArrayList<>();
            return this;
        }

        public CreateServiceRequest build() {
            CreateServiceRequest request = new CreateServiceRequest();
            request.name = this.name;
            request.description = this.description;
            request.price = this.price;
            request.location = this.location;
            request.minDays = this.minDays;
            request.maxDays = this.maxDays;
            request.minCapacity = this.minCapacity;
            request.maxCapacity = this.maxCapacity;
            request.availableSlots = this.availableSlots;
            request.duration = this.duration;
            request.capacity = this.capacity;
            request.tag = this.tag;
            request.imageUrl = this.imageUrl;
            request.highlights = this.highlights;
            request.included = this.included;
            request.itinerary = this.itinerary;
            return request;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

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

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
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