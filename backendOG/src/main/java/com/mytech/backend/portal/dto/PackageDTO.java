package com.mytech.backend.portal.dto;

import com.mytech.backend.portal.models.Area;
import com.mytech.backend.portal.models.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageDTO {
    private Long id;
    private String name;
    private String location;
    private String image;
    private Integer days;
    private Category.CategoryName category;
    private Area.AreaName area;
    private String foodType;
    private String tentType;
    private String activities;
    private Integer maxPeople;
    private Integer availableSlots;
    private Double price;
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
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public Integer getDays() {
		return days;
	}
	public void setDays(Integer days) {
		this.days = days;
	}
	public Category.CategoryName getCategory() {
		return category;
	}
	public void setCategory(Category.CategoryName category) {
		this.category = category;
	}
	public Area.AreaName getArea() {
		return area;
	}
	public void setArea(Area.AreaName area) {
		this.area = area;
	}
	public String getFoodType() {
		return foodType;
	}
	public void setFoodType(String foodType) {
		this.foodType = foodType;
	}
	public String getTentType() {
		return tentType;
	}
	public void setTentType(String tentType) {
		this.tentType = tentType;
	}
	public String getActivities() {
		return activities;
	}
	public void setActivities(String activities) {
		this.activities = activities;
	}
	public Integer getMaxPeople() {
		return maxPeople;
	}
	public void setMaxPeople(Integer maxPeople) {
		this.maxPeople = maxPeople;
	}
	public Integer getAvailableSlots() {
		return availableSlots;
	}
	public void setAvailableSlots(Integer availableSlots) {
		this.availableSlots = availableSlots;
	}
	public Double getPrice() {
		return price;
	}
	public void setPrice(Double price) {
		this.price = price;
	}
    
}
