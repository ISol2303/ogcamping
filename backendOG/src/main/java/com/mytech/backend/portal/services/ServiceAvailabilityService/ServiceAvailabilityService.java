package com.mytech.backend.portal.services.ServiceAvailabilityService;

import com.mytech.backend.portal.dto.Service.AvailabilityBatchRequest;
import com.mytech.backend.portal.dto.Service.ServiceAvailabilityDTO;

import java.util.List;

public interface ServiceAvailabilityService {
    ServiceAvailabilityDTO createAvailability(Long serviceId, ServiceAvailabilityDTO dto);
    ServiceAvailabilityDTO updateAvailability(Long availabilityId, ServiceAvailabilityDTO dto);
    void deleteAvailability(Long availabilityId);
    List<ServiceAvailabilityDTO> getAvailabilityByService(Long serviceId);
    List<ServiceAvailabilityDTO> createAvailabilityBatch(Long serviceId, AvailabilityBatchRequest request);
}
