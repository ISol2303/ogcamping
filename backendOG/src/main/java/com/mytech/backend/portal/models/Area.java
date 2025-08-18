package com.mytech.backend.portal.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "areas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Area extends AbstractEntity{
    /**
	 * 
	 */
	private static final long serialVersionUID = -74787625499070100L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private AreaName name;

    @Column
    private String description = "";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum AreaName {
    	INSIDE_TENT, OUTSIDE_TENT, KITCHEN
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public AreaName getName() {
		return name;
	}

	public void setName(AreaName name) {
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