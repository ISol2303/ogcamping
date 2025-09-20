package com.mytech.backend.portal.dto;

import com.mytech.backend.portal.models.Area;
import com.mytech.backend.portal.models.Gear.GearStatus;

import lombok.Data;

@Data
public class CreateGearRequest {
    private String name;
    private String category;
    private Area.AreaName area;
    private String description;
    private Integer quantityInStock;
    private String image;
    private Integer available;
    private Double pricePerDay;
    private Integer total;
    private GearStatus status;
    
	public CreateGearRequest() {
		super();
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
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
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public Integer getQuantityInStock() {
		return quantityInStock;
	}
	public void setQuantityInStock(Integer quantityInStock) {
		this.quantityInStock = quantityInStock;
	}
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public Integer getAvailable() {
		return available;
	}
	public void setAvailable(Integer available) {
		this.available = available;
	}
	public Double getPricePerDay() {
		return pricePerDay;
	}
	public void setPricePerDay(Double pricePerDay) {
		this.pricePerDay = pricePerDay;
	}
	public Integer getTotal() {
		return total;
	}
	public void setTotal(Integer total) {
		this.total = total;
	}
	public GearStatus getStatus() {
		return status;
	}
	public void setStatus(GearStatus status) {
		this.status = status;
	}
    
}
