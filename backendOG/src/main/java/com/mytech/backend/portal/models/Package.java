package com.mytech.backend.portal.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Package extends AbstractEntity{
    /**
	 * 
	 */
	private static final long serialVersionUID = -5586396492415978289L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column
    private String image;

    @Column(nullable = false)
    private Integer days;
    
    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Area.AreaName area;

    @Column(name = "food_type")
    private String foodType;

    @Column(name = "tent_type")
    private String tentType;

    @Column
    private String activities;

    @Column(name = "max_people", nullable = false)
    private Integer maxPeople;

    @Column(name = "available_slots", nullable = false)
    private Integer availableSlots;

    @Column(nullable = false)
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

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public Area.AreaName getArea() {
		return area;
	}

	public void setArea(Area.AreaName area) {
		this.area = area;
	}
    
}