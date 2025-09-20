package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.models.Area.AreaName;
import com.mytech.backend.portal.models.Gear.GearStatus;

public interface GearService {
	GearDTO createGear(GearDTO dto);
	GearDTO getGearById(Long id);
    List<GearDTO> getAllGears();
    GearDTO updateGear(Long id, GearDTO dto);
    void deleteGear(Long id);
    List<GearDTO> findAll();
    List<GearDTO> searchGears(String name, String category, AreaName area, GearStatus status);
}
