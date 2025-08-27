package com.mytech.backend.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mytech.backend.portal.models.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
	
}

