package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.models.Location;
import com.mytech.backend.portal.services.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/apis/locations")
public class LocationController {

    private final LocationService locationService;

    @Autowired
    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    // Tạo location
    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        Location saved = locationService.createLocation(location);
        return ResponseEntity.ok(saved);
    }

    // Lấy tất cả locations
    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        List<Location> list = locationService.getAllLocations();
        return ResponseEntity.ok(list);
    }

    // Cũng expose under /all nếu frontend cũ gọi /all
    @GetMapping("/all")
    public ResponseEntity<List<Location>> getAllLocationsAlias() {
        return getAllLocations();
    }
}
