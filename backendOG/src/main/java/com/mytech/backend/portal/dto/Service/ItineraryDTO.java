package com.mytech.backend.portal.dto.Service;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryDTO {
    private String day;
    private String title;
    private List<String> activities = new ArrayList<>();
    public static class Builder {
        private String day;
        private String title;
        private List<String> activities = new ArrayList<>();

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

        public ItineraryDTO build() {
            ItineraryDTO itineraryDTO = new ItineraryDTO();
            itineraryDTO.day = this.day;
            itineraryDTO.title = this.title;
            itineraryDTO.activities = this.activities;
            return itineraryDTO;
        }
    }

    public static Builder builder() {
        return new Builder();
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
    
}
