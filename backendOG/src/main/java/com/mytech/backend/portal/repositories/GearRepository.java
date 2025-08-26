package com.mytech.backend.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mytech.backend.portal.models.Gear;

@Repository
public interface GearRepository extends JpaRepository<Gear, Long> {
}
