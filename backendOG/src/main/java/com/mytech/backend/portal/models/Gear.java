package com.mytech.backend.portal.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "gears")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gear extends AbstractEntity{
    /**
	 * 
	 */
	private static final long serialVersionUID = 3169773281153641708L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category.CategoryName category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Area.AreaName area;

    @Column
    private String description;

    @Column(name = "quantity_in_stock", nullable = false)
    private Integer quantityInStock;

    @Column
    private String image;

    @Column
    private Integer available = 0;

    @Column(name = "price_per_day", nullable = false)
    private Double pricePerDay;

    @Column
    private Integer total = 0;

    @Enumerated(EnumType.STRING)
    @Column
    private GearStatus status = GearStatus.AVAILABLE;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum GearStatus {
        AVAILABLE, OUT_OF_STOCK
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

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
    
}