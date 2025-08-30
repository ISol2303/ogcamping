package com.mytech.backend.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mytech.backend.portal.models.Area;

public interface AreaRepository extends JpaRepository<Area, Long> {
}
