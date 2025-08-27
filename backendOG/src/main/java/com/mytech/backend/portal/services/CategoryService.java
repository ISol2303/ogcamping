package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.CategoryDTO;

public interface CategoryService {
	List<CategoryDTO> findAll();
}
