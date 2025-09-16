package com.mytech.backend.portal.models;

import jakarta.persistence.*;

@Entity
@Table(name = "dishes")
public class Dish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private double price;

    private int quantity; // số lượng phục vụ còn lại

    private String imageUrl; // link ảnh upload

    private String status;

    private String category;

    public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	// ===== Constructors =====
    public Dish() {}

    public Dish(Long id, String name, String description, double price, int quantity,
                String imageUrl, String category , String status) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
        this.category = category;
        this.status = status;
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

  

    public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	private void updateStatus() {
        this.status = (this.quantity > 0) ? "AVAILABLE" : "SOLD_OUT";
    }

	// ===== Builder Pattern =====
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
        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Dish build() {
            return new Dish(id, name, description, price, quantity, imageUrl, category , status);
        }
    }

    // Helper method để gọi Builder
    public static Builder builder() {
        return new Builder();
    }
}
