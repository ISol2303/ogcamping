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
<<<<<<< HEAD
    public ResponseEntity<ServiceResponseDTO> getServiceById(@PathVariable(name = "id") Long id) {
=======
    public ResponseEntity<ServiceResponseDTO> getServiceById(@PathVariable("id") Long id) {
>>>>>>> 4b112d9 (Add or update frontend & backend code)
        ServiceResponseDTO service = serviceService.getServiceById(id);
        return ResponseEntity.ok(service);
    }

<<<<<<< HEAD

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
=======
    // POST /services → tạo mới service (có thể kèm file ảnh)
    @PostMapping
    public ResponseEntity<ServiceResponseDTO> createService(
            @RequestPart("service") String serviceJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestPart(value = "extraImages", required = false) MultipartFile[] extraImages
    ) throws IOException {
        ServiceRequestDTO dto = new ObjectMapper().readValue(serviceJson, ServiceRequestDTO.class);
        ServiceResponseDTO response = serviceService.createService(dto, imageFile, extraImages);
>>>>>>> 4b112d9 (Add or update frontend & backend code)
        return ResponseEntity.ok(response);
    }


<<<<<<< HEAD
    // PUT /services/{id} → cập nhật
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> updateService(@PathVariable Long id,
                                                            @RequestBody ServiceRequestDTO req) {
        ServiceResponseDTO service = serviceService.updateService(id, req);
        return ResponseEntity.ok(service);
    }

=======
    // PUT /services/{id} → cập nhật service
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> updateService(
            @PathVariable Long id,
            @RequestPart("service") String serviceJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) throws IOException {
        ServiceRequestDTO dto = new ObjectMapper().readValue(serviceJson, ServiceRequestDTO.class);
        ServiceResponseDTO response = serviceService.updateService(id, dto, imageFile); // ✅ đúng
        return ResponseEntity.ok(response);
    }


>>>>>>> 4b112d9 (Add or update frontend & backend code)
    // DELETE /services/{id} → xóa (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

<<<<<<< HEAD
    // GET /services/tag/{tag} → filter theo tag
=======
    // GET /services/tag/{tag} → lọc theo tag (POPULAR / NEW / DISCOUNT)
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<ServiceResponseDTO>> getServicesByTag(@PathVariable String tag) {
        List<ServiceResponseDTO> services = serviceService.getServicesByTag(tag);
        return ResponseEntity.ok(services);
    }
}
<<<<<<< HEAD
=======

>>>>>>> 4b112d9 (Add or update frontend & backend code)
