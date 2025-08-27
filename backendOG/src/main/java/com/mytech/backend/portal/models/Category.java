package com.mytech.backend.portal.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends AbstractEntity{
	private static final long serialVersionUID = 1541660217813447786L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private CategoryName name;

    @Column
    private String description = "";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum CategoryName {
    	TENT, SLEEPING_BAG, AIR_MATTRESS, FOLDING_TABLE, FOLDING_CHAIR, STOVE, LAMP, OTHER
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public CategoryName getName() {
		return name;
	}

	public void setName(CategoryName name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
    
}