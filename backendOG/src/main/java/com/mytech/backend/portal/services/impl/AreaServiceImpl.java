
package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.AreaDTO;
import com.mytech.backend.portal.models.Area;
import com.mytech.backend.portal.repositories.AreaRepository;
import com.mytech.backend.portal.services.AreaService;

@Service
public class AreaServiceImpl implements AreaService {
    
    @Autowired
    private AreaRepository areaRepository;
    
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<AreaDTO> findAll() {
        return areaRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private AreaDTO mapToDTO(Area area) {
        return modelMapper.map(area, AreaDTO.class);
    }

    private Area mapToEntity(AreaDTO areaDTO) {
        return modelMapper.map(areaDTO, Area.class);
    }
}
