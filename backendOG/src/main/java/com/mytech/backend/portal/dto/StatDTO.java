package com.mytech.backend.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatDTO {
    private String title;
    private String value;
    private String icon;
    private String color;
    private String change;
    // Constructor, getters, and setters...
    
<<<<<<< HEAD
	public String getTitle() {
		return title;
	}
=======
>>>>>>> abb7547f89df2c8b7d3c755c04871e4e890df328
	public StatDTO(String title, String value, String icon, String color, String change) {
		super();
		this.title = title;
		this.value = value;
		this.icon = icon;
		this.color = color;
		this.change = change;
	}
<<<<<<< HEAD
	public void setTitle(String title) {
		this.title = title;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public String getIcon() {
		return icon;
	}
	public void setIcon(String icon) {
		this.icon = icon;
	}
	public String getColor() {
		return color;
	}
	public void setColor(String color) {
		this.color = color;
	}
	public String getChange() {
		return change;
	}
	public void setChange(String change) {
		this.change = change;
	}
    
=======
	
	public StatDTO(String label, long totalUsers) {
		super();
		this.label = label;
		this.value = String.valueOf(totalUsers);
	}
>>>>>>> abb7547f89df2c8b7d3c755c04871e4e890df328
}