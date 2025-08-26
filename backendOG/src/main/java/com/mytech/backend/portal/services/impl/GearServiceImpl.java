package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.models.Gear;
import com.mytech.backend.portal.repositories.GearRepository;
import com.mytech.backend.portal.services.GearService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GearServiceImpl implements GearService {
	@Autowired
    private GearRepository gearRepository;
	@Autowired
    private ModelMapper modelMapper;

    @Override
    public GearDTO createGear(GearDTO dto) {
        Gear gear = modelMapper.map(dto, Gear.class);
        return modelMapper.map(gearRepository.save(gear), GearDTO.class);
    }

    @Override
    public GearDTO getGearById(Long id) {
        return gearRepository.findById(id)
                .map(gear -> modelMapper.map(gear, GearDTO.class))
                .orElse(null);
    }

    @Override
    public List<GearDTO> getAllGears() {
        return gearRepository.findAll().stream()
                .map(gear -> modelMapper.map(gear, GearDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public GearDTO updateGear(Long id, GearDTO dto) {
        Gear gear = modelMapper.map(dto, Gear.class);
        gear.setId(id);
        return modelMapper.map(gearRepository.save(gear), GearDTO.class);
    }

    @Override
    public void deleteGear(Long id) {
        gearRepository.deleteById(id);
    }
}
