package com.mytech.backend.portal.models.Service;

import com.mytech.backend.portal.models.Booking.Booking;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;            // VD: Cắm trại núi cao Sapa
    private String description;     // Mô tả chi tiết
    private Double price;           // Giá trọn gói
    private String location;        // VD: Sapa, Lào Cai

    private Integer minDays;        // VD: 2
    private Integer maxDays;        // VD: 3
    private Integer minCapacity;    // VD: 4
    private Integer maxCapacity;    // VD: 6
    private Integer availableSlots; // VD: 3

    private Boolean active = true;
    private Double averageRating;   // VD: 4.8
    private Integer totalReviews;   // VD: 124
    private String duration;        // Ví dụ: "2-3 ngày"
    private String capacity;        // Ví dụ: "4-6 người"

    @Enumerated(EnumType.STRING)
    private ServiceTag tag;         // POPULAR / NEW / DISCOUNT

    private String imageUrl;        // Ảnh chính của service

    // Danh sách highlights
    @ElementCollection
    @CollectionTable(name = "service_highlights", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "highlight")
    private List<String> highlights = new ArrayList<>();

    // Danh sách included items
    @ElementCollection
    @CollectionTable(name = "service_included", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "item")
    private List<String> included = new ArrayList<>();

    // Lịch trình chi tiết (itinerary)
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItineraryItem> itinerary = new ArrayList<>();

    // Reviews
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceReview> reviews = new ArrayList<>();

    // Liên kết với booking
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();

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

	public Boolean getActive() {
		return active;
	}

	public void setActive(Boolean active) {
		this.active = active;
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

	public List<ItineraryItem> getItinerary() {
		return itinerary;
	}

	public void setItinerary(List<ItineraryItem> itinerary) {
		this.itinerary = itinerary;
	}

	public List<ServiceReview> getReviews() {
		return reviews;
	}

	public void setReviews(List<ServiceReview> reviews) {
		this.reviews = reviews;
	}

	public List<Booking> getBookings() {
		return bookings;
	}

	public void setBookings(List<Booking> bookings) {
		this.bookings = bookings;
	}
	
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
        private Boolean active;
        private Double averageRating;
        private Integer totalReviews;
        private String duration;
        private String capacity;
        private ServiceTag tag;
        private String imageUrl;
        private List<String> highlights = new ArrayList<>();
        private List<String> included = new ArrayList<>();
        private List<ItineraryItem> itinerary = new ArrayList<>();
        private List<ServiceReview> reviews = new ArrayList<>();
        private List<Booking> bookings = new ArrayList<>();

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

        public Builder active(Boolean active) {
            this.active = active;
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

        public Builder itinerary(List<ItineraryItem> itinerary) {
            this.itinerary = itinerary != null ? itinerary : new ArrayList<>();
            return this;
        }

        public Builder reviews(List<ServiceReview> reviews) {
            this.reviews = reviews != null ? reviews : new ArrayList<>();
            return this;
        }

        public Builder bookings(List<Booking> bookings) {
            this.bookings = bookings != null ? bookings : new ArrayList<>();
            return this;
        }

        public Service build() {
            Service service = new Service();
            service.id = this.id;
            service.name = this.name;
            service.description = this.description;
            service.price = this.price;
            service.location = this.location;
            service.minDays = this.minDays;
            service.maxDays = this.maxDays;
            service.minCapacity = this.minCapacity;
            service.maxCapacity = this.maxCapacity;
            service.availableSlots = this.availableSlots;
            service.active = this.active != null ? this.active : true;
            service.averageRating = this.averageRating;
            service.totalReviews = this.totalReviews;
            service.duration = this.duration;
            service.capacity = this.capacity;
            service.tag = this.tag;
            service.imageUrl = this.imageUrl;
            service.highlights = this.highlights;
            service.included = this.included;
            service.itinerary = this.itinerary;
            service.reviews = this.reviews;
            service.bookings = this.bookings;
            return service;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}

