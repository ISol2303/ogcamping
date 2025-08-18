package com.mytech.backend.portal.services.Service;


import com.mytech.backend.portal.dto.Service.ServiceRequestDTO;
import com.mytech.backend.portal.dto.Service.ServiceResponseDTO;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.models.Service.ServiceTag;
import com.mytech.backend.portal.repositories.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;

    @Override
    public List<ServiceResponseDTO> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public ServiceResponseDTO getServiceById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        return mapToDTO(service);
    }

    @Override
    public ServiceResponseDTO createService(ServiceRequestDTO req, MultipartFile imageFile) throws IOException {
        Service service = Service.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .location(req.getLocation())
                .minDays(req.getMinDays())
                .maxDays(req.getMaxDays())
                .minCapacity(req.getMinCapacity())
                .maxCapacity(req.getMaxCapacity())
                .active(true)
                .tag(ServiceTag.valueOf(req.getTag().toUpperCase()))
                .build();
        //luu anh o may tinh nha
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
            Path uploadPath = Paths.get("C:/Users/Admin/OneDrive/Desktop/ogcamping/backendOG/uploads/services"); // thư mục lưu ảnh
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(fileName);
            imageFile.transferTo(filePath.toFile());

            service.setImageUrl("/uploads/services/" + fileName); // lưu đường dẫn relative
        }

        service = serviceRepository.save(service);
        return mapToDTO(service);
    }

    @Override
    public ServiceResponseDTO updateService(Long id, ServiceRequestDTO req) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        service.setName(req.getName());
        service.setDescription(req.getDescription());
        service.setPrice(req.getPrice());
        service.setLocation(req.getLocation());
        service.setMinDays(req.getMinDays());
        service.setMaxDays(req.getMaxDays());
        service.setMinCapacity(req.getMinCapacity());
        service.setMaxCapacity(req.getMaxCapacity());
        service.setTag(ServiceTag.valueOf(req.getTag().toUpperCase()));

        serviceRepository.save(service);
        return mapToDTO(service);
    }

    @Override
    public List<ServiceResponseDTO> getServicesByTag(String tag) {
        ServiceTag serviceTag = ServiceTag.valueOf(tag.toUpperCase());
        return serviceRepository.findByTag(serviceTag).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public void deleteService(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setActive(false); // soft delete
        serviceRepository.save(service);
    }

    private ServiceResponseDTO mapToDTO(Service service) {
        return ServiceResponseDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .price(service.getPrice())
                .location(service.getLocation())
                .minDays(service.getMinDays())
                .maxDays(service.getMaxDays())
                .minCapacity(service.getMinCapacity())
                .maxCapacity(service.getMaxCapacity())
                .active(service.getActive())
                .tag(service.getTag())
                .averageRating(service.getAverageRating())
                .totalReviews(service.getTotalReviews())
                .availableSlots(service.getAvailableSlots())
                .imageUrl(service.getImageUrl())
                .build();
    }
}