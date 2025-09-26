
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
import com.mytech.backend.portal.models.Gear;
import com.mytech.backend.portal.repositories.CategoryRepository;
import com.mytech.backend.portal.repositories.GearRepository;
import com.mytech.backend.portal.services.CategoryService;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private GearRepository gearRepository;
    
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
            throw new ResourceAlreadyExistsException("Danh mục với tên '" + categoryDTO.getName() + "' đã tồn tại. Vui lòng chọn tên khác.");
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
            throw new ResourceAlreadyExistsException("Danh mục với tên '" + categoryDTO.getName() + "' đã tồn tại. Vui lòng chọn tên khác.");
        }
        
        // Lưu tên cũ để cập nhật sản phẩm
        String oldCategoryName = existingCategory.getName();
        String newCategoryName = categoryDTO.getName();
        
        // Cập nhật danh mục
        existingCategory.setName(newCategoryName);
        existingCategory.setDescription(categoryDTO.getDescription());
        
        Category updatedCategory = categoryRepository.save(existingCategory);
        
        // Cập nhật tên danh mục trong tất cả sản phẩm nếu tên đã thay đổi
        if (!oldCategoryName.equals(newCategoryName)) {
            List<Gear> gearsWithOldCategory = gearRepository.findByCategory(oldCategoryName);
            for (Gear gear : gearsWithOldCategory) {
                gear.setCategory(newCategoryName);
            }
            gearRepository.saveAll(gearsWithOldCategory);
        }
        
        return mapToDTO(updatedCategory);
    }

    @Override
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        
        // Kiểm tra xem danh mục có sản phẩm không
        long gearCount = gearRepository.countByCategory(category.getName());
        if (gearCount > 0) {
            throw new IllegalStateException("❌ Không thể xóa danh mục '" + category.getName() + 
                    "' vì danh mục này đang có " + gearCount + " sản phẩm. " +
                    "Vui lòng di chuyển hoặc xóa tất cả sản phẩm trong danh mục này trước khi xóa danh mục.");
        }
        
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return categoryRepository.existsByName(name);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getProductCountByCategoryName(String categoryName) {
        return gearRepository.countByCategory(categoryName);
    }

    private CategoryDTO mapToDTO(Category category) {
        return modelMapper.map(category, CategoryDTO.class);
    }

    private Category mapToEntity(CategoryDTO categoryDTO) {
        return modelMapper.map(categoryDTO, Category.class);
    }
}
