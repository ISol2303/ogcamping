package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.DishRequestDTO;
import com.mytech.backend.portal.dto.DishResponseDTO;
import com.mytech.backend.portal.models.Dish;
import com.mytech.backend.portal.repositories.DishRepository;
import com.mytech.backend.portal.services.DishService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DishServiceImpl implements DishService {
	
	@Autowired
    private  DishRepository repo;

    private DishResponseDTO mapToResponse(Dish dish) {
        return DishResponseDTO.builder()
                .id(dish.getId())
                .name(dish.getName())
                .description(dish.getDescription())
                .price(dish.getPrice())
                .quantity(dish.getQuantity())
                .imageUrl(dish.getImageUrl())
                .category(dish.getCategory())
                .status(dish.getStatus())
                .build();
    }

    private Dish mapFromDto(DishResponseDTO dto) {
        Dish dish = Dish.builder()
                // id intentionally left null for create; for update we load existing entity
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .quantity(dto.getQuantity())
                .imageUrl(dto.getImageUrl())
                .category(dto.getCategory())
                .status(dto.getStatus())
                .build();

        // Nếu client không truyền status thì set theo quantity
        if (dish.getStatus() == null || dish.getStatus().isEmpty()) {
            if (dish.getQuantity() > 0) {
                dish.setStatus("AVAILABLE");
            } else {
                dish.setStatus("SOLD_OUT");
            }
        }

        return dish;
    }


    //GET ALL
    @Override
    public List<DishResponseDTO> getAll() {
        return repo.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // GET BYID
    @Override
    public DishResponseDTO getById(Long id) {
        Dish dish = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Dish not found with id: " + id));
        return mapToResponse(dish);
    }

    //CREATEo
    @Override
    public DishResponseDTO create(DishResponseDTO dto) {
        // Using DTO as request payload per your service signature
        Dish saved = repo.save(mapFromDto(dto));
        return mapToResponse(saved);
    }

    //UPDATE
    @Override
    public DishResponseDTO update(Long id, DishResponseDTO dto) {
        Dish existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Dish not found with id: " + id));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setQuantity(dto.getQuantity());
        existing.setImageUrl(dto.getImageUrl());
        existing.setCategory(dto.getCategory());

        if (dto.getQuantity() <= 0) {
        	existing.setStatus("SOLD_OUT");
        } else {
        	existing.setStatus("AVAILABLE");
        }

        Dish updated = repo.save(existing);
        return mapToResponse(updated);
    }

    //DELETE
    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Dish not found with id: " + id);
        }
        repo.deleteById(id);
    }

    //GET BY CATEGORY
    @Override
    public List<DishResponseDTO> getByCategory(String category) {
        return repo.findByCategory(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // SEARCH BY NAME
    @Override
    public List<DishResponseDTO> searchByName(String query) {
        if (query == null || query.isBlank()) {
            return getAll();
        }
        String q = query.toLowerCase();
        return repo.findAll().stream()
                .filter(d -> d.getName() != null && d.getName().toLowerCase().contains(q))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    @Override
    public List<DishResponseDTO> createBatch(List<DishRequestDTO> dtos) {
        List<Dish> dishes = dtos.stream()
                .map(dto -> Dish.builder()
                        .name(dto.getName())
                        .description(dto.getDescription())
                        .price(dto.getPrice())
                        .quantity(dto.getQuantity())
                        .imageUrl(dto.getImageUrl())
                        .category(dto.getCategory())
                        .status(dto.getQuantity() > 0 ? "AVAILABLE" : "SOLD_OUT")
                        
                        .build())
                .toList();

        List<Dish> saved = repo.saveAll(dishes);

        return saved.stream()
                .map(dish -> DishResponseDTO.builder()
                        .id(dish.getId())
                        .name(dish.getName())
                        .description(dish.getDescription())
                        .price(dish.getPrice())
                        .quantity(dish.getQuantity())
                        .imageUrl(dish.getImageUrl())
                        .category(dish.getCategory())
                        
                        .build())
                .toList();
    }

}
