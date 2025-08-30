package com.mytech.backend.portal.models;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "service_itinerary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String day;            // Ngày 1, Ngày 2...
    private String title;          // Tên hoạt động chính
    @ElementCollection
    @CollectionTable(name = "itinerary_activities", joinColumns = @JoinColumn(name = "itinerary_id"))
    @Column(name = "activity")
    private List<String> activities = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getDay() {
		return day;
	}

	public void setDay(String day) {
		this.day = day;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public List<String> getActivities() {
		return activities;
	}

	public void setActivities(List<String> activities) {
		this.activities = activities;
	}

	public Service getService() {
		return service;
	}

	public void setService(Service service) {
		this.service = service;
	}
	public static class Builder {
        private Long id;
        private String day;
        private String title;
        private List<String> activities = new ArrayList<>();
        private Service service;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder day(String day) {
            this.day = day;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder activities(List<String> activities) {
            this.activities = activities != null ? activities : new ArrayList<>();
            return this;
        }

        public Builder service(Service service) {
            this.service = service;
            return this;
        }

        public ItineraryItem build() {
            ItineraryItem itineraryItem = new ItineraryItem();
            itineraryItem.id = this.id;
            itineraryItem.day = this.day;
            itineraryItem.title = this.title;
            itineraryItem.activities = this.activities;
            itineraryItem.service = this.service;
            return itineraryItem;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
    
}
