package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.CategoryDTO;

public interface CategoryService {
    List<CategoryDTO> findAll();
    CategoryDTO findById(Long id);
    CategoryDTO create(CategoryDTO categoryDTO);
    CategoryDTO update(Long id, CategoryDTO categoryDTO);
    void delete(Long id);
    boolean existsByName(String name);
}
