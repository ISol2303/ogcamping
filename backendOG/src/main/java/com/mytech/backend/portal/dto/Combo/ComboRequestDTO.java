package com.mytech.backend.portal.dto.Combo;
import lombok.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboRequestDTO {
    private String name;
    private String description;
    private Double price;
    private Boolean active;
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
	public Boolean getActive() {
		return active;
	}
	public void setActive(Boolean active) {
		this.active = active;
	}
    
}