package com.mytech.backend.portal.apis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytech.backend.portal.dto.Service.ServiceRequestDTO;
import com.mytech.backend.portal.dto.Service.ServiceResponseDTO;
import com.mytech.backend.portal.services.Service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/apis/v1/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    // GET /services → list tất cả dịch vụ
    @GetMapping
    public ResponseEntity<List<ServiceResponseDTO>> getAllServices() {
        List<ServiceResponseDTO> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    // GET /services/{id} → chi tiết service
    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> getServiceById(@PathVariable(name = "id") Long id) {
        ServiceResponseDTO service = serviceService.getServiceById(id);
        return ResponseEntity.ok(service);
    }


    // POST /services → tạo mới
//    @PostMapping
//    public ResponseEntity<ServiceResponseDTO> createService(@RequestBody ServiceRequestDTO req) {
//        ServiceResponseDTO service = serviceService.createService(req);
//        return ResponseEntity.ok(service);
//    }

    @PostMapping
    public ResponseEntity<ServiceResponseDTO> createService(
            @RequestPart("service") String serviceJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) throws IOException {
        // Chuyển JSON string thành DTO
        ServiceRequestDTO dto = new ObjectMapper().readValue(serviceJson, ServiceRequestDTO.class);
        ServiceResponseDTO response = serviceService.createService(dto, imageFile);
        return ResponseEntity.ok(response);
    }


    // PUT /services/{id} → cập nhật
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> updateService(@PathVariable Long id,
                                                            @RequestBody ServiceRequestDTO req) {
        ServiceResponseDTO service = serviceService.updateService(id, req);
        return ResponseEntity.ok(service);
    }

    // DELETE /services/{id} → xóa (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    // GET /services/tag/{tag} → filter theo tag
    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<ServiceResponseDTO>> getServicesByTag(@PathVariable String tag) {
        List<ServiceResponseDTO> services = serviceService.getServicesByTag(tag);
        return ResponseEntity.ok(services);
    }
}
