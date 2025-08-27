// com/mytech/backend/portal/service/impl/LocationServiceImpl.java
package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.LocationDTO;
import com.mytech.backend.portal.models.Location;
import com.mytech.backend.portal.repositories.LocationRepository;
import com.mytech.backend.portal.services.LocationService;

@Service
public class LocationServiceImpl implements LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Override
    public List<LocationDTO> findAll() {
        return locationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private LocationDTO convertToDTO(Location location) {
        LocationDTO dto = new LocationDTO();
        dto.setId(location.getId());
        dto.setName(location.getName());
        dto.setAddress(location.getAddress());
        dto.setCapacity(location.getCapacity());
        dto.setStatus(location.getStatus());
        return dto;
    }
}