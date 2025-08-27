package com.mytech.backend.portal.dto.Service;
import java.util.ArrayList;
import java.util.List;

import com.mytech.backend.portal.models.Service.ServiceTag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceResponseDTO {
    private Long id;
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
    private Double averageRating;
    private Integer totalReviews;
    private String imageUrl;
    private List<String> highlights;
    private List<String> included;
    private List<ItineraryDTO> itinerary;
    public static class Builder {
        private Long id;
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
        private Double averageRating;
        private Integer totalReviews;
        private String imageUrl;
        private List<String> highlights = new ArrayList<>();
        private List<String> included = new ArrayList<>();
        private List<ItineraryDTO> itinerary = new ArrayList<>();

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

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

        public Builder averageRating(Double averageRating) {
            this.averageRating = averageRating;
            return this;
        }

        public Builder totalReviews(Integer totalReviews) {
            this.totalReviews = totalReviews;
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

        public ServiceResponseDTO build() {
            ServiceResponseDTO serviceResponseDTO = new ServiceResponseDTO();
            serviceResponseDTO.id = this.id;
            serviceResponseDTO.name = this.name;
            serviceResponseDTO.description = this.description;
            serviceResponseDTO.price = this.price;
            serviceResponseDTO.location = this.location;
            serviceResponseDTO.minDays = this.minDays;
            serviceResponseDTO.maxDays = this.maxDays;
            serviceResponseDTO.minCapacity = this.minCapacity;
            serviceResponseDTO.maxCapacity = this.maxCapacity;
            serviceResponseDTO.availableSlots = this.availableSlots;
            serviceResponseDTO.duration = this.duration;
            serviceResponseDTO.capacity = this.capacity;
            serviceResponseDTO.tag = this.tag;
            serviceResponseDTO.averageRating = this.averageRating;
            serviceResponseDTO.totalReviews = this.totalReviews;
            serviceResponseDTO.imageUrl = this.imageUrl;
            serviceResponseDTO.highlights = this.highlights;
            serviceResponseDTO.included = this.included;
            serviceResponseDTO.itinerary = this.itinerary;
            return serviceResponseDTO;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public Double getAverageRating() {
		return averageRating;
	}

	public void setAverageRating(Double averageRating) {
		this.averageRating = averageRating;
	}

	public Integer getTotalReviews() {
		return totalReviews;
	}

	public void setTotalReviews(Integer totalReviews) {
		this.totalReviews = totalReviews;
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
