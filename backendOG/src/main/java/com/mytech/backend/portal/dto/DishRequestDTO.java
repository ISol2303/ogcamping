package com.mytech.backend.portal.dto;

import org.springframework.web.multipart.MultipartFile;

public class DishRequestDTO {
    private String name;
    private String description;
    private double price;
    private int quantity;
    private String imageUrl;
    private String category; // CHUYỂN THÀNH STRING
    private MultipartFile file;

    public DishRequestDTO() {}

    public DishRequestDTO(String name, String description, double price, int quantity,
                          String imageUrl, String category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
        this.category = category;
    }

    // Getters & Setters
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

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public MultipartFile getFile() { return file; }
    public void setFile(MultipartFile file) { this.file = file; }
}
