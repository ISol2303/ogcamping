package com.mytech.backend.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mytech.backend.portal.models.Combo.ComboItem;

public interface ComboItemRepository extends JpaRepository<ComboItem, Long> {}
