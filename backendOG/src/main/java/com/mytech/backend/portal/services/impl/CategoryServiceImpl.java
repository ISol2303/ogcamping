
package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mytech.backend.portal.dto.CategoryDTO;
import com.mytech.backend.portal.exceptions.ResourceNotFoundException;
import com.mytech.backend.portal.exceptions.ResourceAlreadyExistsException;
import com.mytech.backend.portal.models.Category;
import com.mytech.backend.portal.repositories.CategoryRepository;
import com.mytech.backend.portal.services.CategoryService;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> findAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToDTO(category);
    }

    @Override
    public CategoryDTO create(CategoryDTO categoryDTO) {
        // Kiểm tra tên danh mục đã tồn tại chưa
        if (existsByName(categoryDTO.getName())) {
            throw new ResourceAlreadyExistsException("Category with name '" + categoryDTO.getName() + "' already exists");
        }
        
        Category category = mapToEntity(categoryDTO);
        Category savedCategory = categoryRepository.save(category);
        return mapToDTO(savedCategory);
    }

    @Override
    public CategoryDTO update(Long id, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        
        // Kiểm tra tên danh mục đã tồn tại chưa (trừ chính nó)
        if (!existingCategory.getName().equals(categoryDTO.getName()) && existsByName(categoryDTO.getName())) {
            throw new ResourceAlreadyExistsException("Category with name '" + categoryDTO.getName() + "' already exists");
        }
        
        existingCategory.setName(categoryDTO.getName());
        existingCategory.setDescription(categoryDTO.getDescription());
        
        Category updatedCategory = categoryRepository.save(existingCategory);
        return mapToDTO(updatedCategory);
    }

    @Override
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return categoryRepository.existsByName(name);
    }

    private CategoryDTO mapToDTO(Category category) {
        return modelMapper.map(category, CategoryDTO.class);
    }

    private Category mapToEntity(CategoryDTO categoryDTO) {
        return modelMapper.map(categoryDTO, Category.class);
    }
}
