package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.models.Area.AreaName;
import com.mytech.backend.portal.models.Category.CategoryName;
import com.mytech.backend.portal.models.Gear.GearStatus;

import java.util.List;

public interface GearService {
	GearDTO createGear(GearDTO dto);
	GearDTO getGearById(Long id);
    List<GearDTO> getAllGears();
    GearDTO updateGear(Long id, GearDTO dto);
    void deleteGear(Long id);
    List<GearDTO> findAll();
    List<GearDTO> searchGears(String name, CategoryName category, AreaName area, GearStatus status);
}
