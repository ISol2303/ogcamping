package com.mytech.backend.portal.dto;
import lombok.Data;
@Data
public class ReviewRequestDTO {
    private Integer rating;  // 1-5
    private String feedback;
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
    
}