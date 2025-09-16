package com.mytech.backend.portal.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DishResponseDTO {
	private Long id;
    private String name;
    private String description;
    private double price;
    private int quantity;
    private String imageUrl;
    private String category;
    private String status; 
    private MultipartFile file;
    
    
    public MultipartFile getFile() {
		return file;
	}
	public void setFile(MultipartFile file) {
		this.file = file;
	}
	public DishResponseDTO(Long id, String name, String description, double price, int quantity, String imageUrl,
			String category, String status) {
		super();
		this.id = id;
		this.name = name;
		this.description = description;
		this.price = price;
		this.quantity = quantity;
		this.imageUrl = imageUrl;
		this.category = category;
		this.status = status;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
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
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public double getPrice() {
		return price;
	}
	public void setPrice(double price) {
		this.price = price;
	}
	public int getQuantity() {
		return quantity;
	}
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}
	public String getImageUrl() {
		return imageUrl;
	}
	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public DishResponseDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	// ================= Builder Pattern =================
    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private double price;
        private int quantity;
        private String imageUrl;
        private String category;
        private String status;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder price(double price) {
            this.price = price;
            return this;
        }

        public Builder quantity(int quantity) {
            this.quantity = quantity;
            return this;
        }

        public Builder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public Builder category(String category) {
            this.category = category;
            return this;
        }
        public Builder status(String status) { this.status = status; return this; }

        public DishResponseDTO build() {
            return new DishResponseDTO(id, name, description, price, quantity, imageUrl, category,status);
        }
    }

    // Helper method để gọi builder dễ hơn
    public static Builder builder() {
        return new Builder();
    }
}
