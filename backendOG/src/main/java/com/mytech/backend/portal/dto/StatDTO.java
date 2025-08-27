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
}