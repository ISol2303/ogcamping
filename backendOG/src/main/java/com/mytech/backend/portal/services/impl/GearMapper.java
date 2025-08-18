package com.mytech.backend.portal.services.impl;

import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.models.Gear;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GearMapper {
    public GearDTO toDTO(Gear gear) {
        GearDTO dto = new GearDTO();
        dto.setId(gear.getId());
        dto.setName(gear.getName());
        dto.setCategory(gear.getCategory());
        dto.setArea(gear.getArea());
        dto.setDescription(gear.getDescription());
        dto.setQuantityInStock(gear.getQuantityInStock());
        dto.setAvailable(gear.getAvailable());
        dto.setPricePerDay(gear.getPricePerDay());
        dto.setStatus(gear.getStatus());
        return dto;
    }

    public List<GearDTO> toDTOList(List<Gear> gears) {
        return gears.stream().map(this::toDTO).toList();
    }
}
