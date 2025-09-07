package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
