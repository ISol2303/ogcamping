package com.mytech.backend.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDTO {
    public CategoryDTO(Long id2, String name2, String description2) {
		// TODO Auto-generated constructor stub
	}
	private Long id;
    private String name;
    private String description;

}
