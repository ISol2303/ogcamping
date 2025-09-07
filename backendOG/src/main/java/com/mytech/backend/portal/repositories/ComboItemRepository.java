package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Combo.ComboItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComboItemRepository extends JpaRepository<ComboItem, Long> {}
