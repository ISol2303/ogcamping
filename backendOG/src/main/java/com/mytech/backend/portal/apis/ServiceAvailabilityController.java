package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Service.AvailabilityBatchRequest;
import com.mytech.backend.portal.dto.Service.ServiceAvailabilityDTO;
import com.mytech.backend.portal.services.ServiceAvailabilityService.ServiceAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/apis/v1/services/{serviceId}/availability")
@RequiredArgsConstructor
public class ServiceAvailabilityController {

    private final ServiceAvailabilityService availabilityService;

    @PostMapping
    public ResponseEntity<ServiceAvailabilityDTO> createAvailability(
            @PathVariable("serviceId") Long serviceId,
            @RequestBody ServiceAvailabilityDTO dto) {
        return ResponseEntity.ok(availabilityService.createAvailability(serviceId, dto));
    }

    @GetMapping
    public ResponseEntity<List<ServiceAvailabilityDTO>> getAvailability(
            @PathVariable("serviceId") Long serviceId) {
        return ResponseEntity.ok(availabilityService.getAvailabilityByService(serviceId));
    }

    @PutMapping("/{availabilityId}")
    public ResponseEntity<ServiceAvailabilityDTO> updateAvailability(
            @PathVariable Long serviceId,
            @PathVariable Long availabilityId,
            @RequestBody ServiceAvailabilityDTO dto) {
        return ResponseEntity.ok(availabilityService.updateAvailability(availabilityId, dto));
    }

    @DeleteMapping("/{availabilityId}")
    public ResponseEntity<Void> deleteAvailability(
            @PathVariable Long serviceId,
            @PathVariable Long availabilityId) {
        availabilityService.deleteAvailability(availabilityId);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/batch")
    public ResponseEntity<List<ServiceAvailabilityDTO>> createAvailabilityBatch(
            @PathVariable("serviceId") Long serviceId,
            @RequestBody AvailabilityBatchRequest request) {
        return ResponseEntity.ok(availabilityService.createAvailabilityBatch(serviceId, request));
    }

}
