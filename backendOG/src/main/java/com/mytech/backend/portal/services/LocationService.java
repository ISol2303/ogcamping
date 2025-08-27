// com/mytech/backend/portal/service/LocationService.java
package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.LocationDTO;

public interface LocationService {
    List<LocationDTO> findAll();
}