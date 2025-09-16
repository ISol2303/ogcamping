package com.mytech.backend.portal.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mytech.backend.portal.models.Dish;

public interface DishRepository extends JpaRepository<Dish, Long> {
    List<Dish> findByCategory(String category);
    
}
