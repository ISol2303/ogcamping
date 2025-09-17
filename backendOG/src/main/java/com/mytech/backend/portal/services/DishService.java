package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.DishRequestDTO;
import com.mytech.backend.portal.dto.DishResponseDTO;
import com.mytech.backend.portal.models.Dish;

public interface DishService {
    List<DishResponseDTO> getAll();
    DishResponseDTO getById(Long id);
    DishResponseDTO create(DishResponseDTO dto);
    DishResponseDTO update(Long id, DishResponseDTO dto);
    void delete(Long id);
    List<DishResponseDTO> getByCategory(String category);
    List<DishResponseDTO> searchByName(String query);
    List<DishResponseDTO> createBatch(List<DishRequestDTO> dtos); // ✅ mới

}
