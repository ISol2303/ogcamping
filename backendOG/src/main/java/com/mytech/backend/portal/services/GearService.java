package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.GearDTO;

public interface GearService {
	GearDTO createGear(GearDTO dto);
	GearDTO getGearById(Long id);
    List<GearDTO> getAllGears();
    GearDTO updateGear(Long id, GearDTO dto);
    void deleteGear(Long id);
}
