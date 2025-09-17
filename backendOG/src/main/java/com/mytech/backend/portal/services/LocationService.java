package com.mytech.backend.portal.services;

import java.util.List;
import java.util.Optional;

import com.mytech.backend.portal.models.Location;

public interface LocationService {
    Location createLocation(Location location);
    Optional<Location> getLocationById(Long id);
    List<Location> getAllLocations();
    Location getOrCreateLocation(Location location);
}