package com.mytech.backend.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
public class StatDTO {
    private String title;
    private String label;
    private String value;
    private String icon;
    private String color;
    private String change;
    // Constructor, getters, and setters...
    
	public String getTitle() {
		return title;
	}
	public StatDTO() {
		super();
	}
	public StatDTO(String title, String value, String icon, String color, String change) {
		super();
		this.title = title;
		this.value = value;
		this.icon = icon;
		this.color = color;
		this.change = change;
	}
	
	public StatDTO(String label, long totalUsers) {
		super();
		this.label = label;
		this.value = String.valueOf(totalUsers);
	}
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
	public String getLabel() {
		return label;
	}
	public void setLabel(String label) {
		this.label = label;
	}
    
}