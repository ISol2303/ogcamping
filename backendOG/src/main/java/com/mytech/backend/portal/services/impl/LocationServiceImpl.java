package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.models.Location;
import com.mytech.backend.portal.repositories.LocationRepository;
import com.mytech.backend.portal.services.LocationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;
    @Autowired
    public LocationServiceImpl(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Override
    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }

    @Override
    public Optional<Location> getLocationById(Long id) {
        return locationRepository.findById(id);
    }

    @Override
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    @Override
    public Location getOrCreateLocation(Location location) {
        if (location.getId() != null) {
            return locationRepository.findById(location.getId())
                    .orElseGet(() -> locationRepository.save(location));
        } else {
            return locationRepository.save(location);
        }
    }
}
