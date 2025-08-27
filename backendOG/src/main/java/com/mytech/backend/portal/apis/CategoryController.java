package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.ApiResponse;
import com.mytech.backend.portal.dto.CategoryDTO;
import com.mytech.backend.portal.repositories.CategoryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/apis/v1/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ApiResponse<List<CategoryDTO>> getCategories() {
        try {
            List<CategoryDTO> categories = categoryRepository.findAll()
                    .stream()
                    .map(c -> new CategoryDTO(
                            c.getId(),
                            c.getName().name(), // Enum -> String
                            c.getDescription()
                    ))
                    .collect(Collectors.toList());

            return ApiResponse.success(categories);
        } catch (Exception e) {
            return ApiResponse.error(500, "Failed to fetch categories: " + e.getMessage());
        }
    }
}
