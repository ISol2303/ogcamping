package com.mytech.backend.portal.services.impl;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mytech.backend.portal.dto.ItineraryDTO;
import com.mytech.backend.portal.dto.ServiceRequestDTO;
import com.mytech.backend.portal.dto.ServiceResponseDTO;
import com.mytech.backend.portal.models.ItineraryItem;
import com.mytech.backend.portal.models.Service;
import com.mytech.backend.portal.models.ServiceTag;
import com.mytech.backend.portal.repositories.ServiceRepository;
import com.mytech.backend.portal.services.ServiceService;

import lombok.RequiredArgsConstructor;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ServiceServiceImpl implements ServiceService {
	@Autowired
    private ServiceRepository serviceRepository;

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

//    @Override
//    public ServiceResponseDTO createService(ServiceRequestDTO req, MultipartFile imageFile) throws IOException {
//        Service service = Service.builder()
//                .name(req.getName())
//                .description(req.getDescription())
//                .price(req.getPrice())
//                .location(req.getLocation())
//                .minDays(req.getMinDays())
//                .maxDays(req.getMaxDays())
//                .minCapacity(req.getMinCapacity())
//                .maxCapacity(req.getMaxCapacity())
//                .active(true)
//                .tag(ServiceTag.valueOf(req.getTag().toUpperCase()))
//                .build();
//        //luu anh o may tinh nha
//        if (imageFile != null && !imageFile.isEmpty()) {
//            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
//            Path uploadPath = Paths.get("C:/Users/Admin/OneDrive/Desktop/ogcamping/backendOG/uploads/services"); // thư mục lưu ảnh
//            if (!Files.exists(uploadPath)) {
//                Files.createDirectories(uploadPath);
//            }
//            Path filePath = uploadPath.resolve(fileName);
//            imageFile.transferTo(filePath.toFile());
//
//            service.setImageUrl("/uploads/services/" + fileName); // lưu đường dẫn relative
//        }
//
//        service = serviceRepository.save(service);
//        return mapToDTO(service);
//    }
@Override
public ServiceResponseDTO createService(ServiceRequestDTO req, MultipartFile imageFile) throws IOException {
    // Tạo entity Service
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
            .availableSlots(req.getAvailableSlots())
            .averageRating(0.0)
            .totalReviews(0)
            .duration(req.getDuration())
            .capacity(req.getCapacity())
            .tag(ServiceTag.valueOf(req.getTag().name()))
            .highlights(req.getHighlights() != null ? req.getHighlights() : new ArrayList<>())
            .included(req.getIncluded() != null ? req.getIncluded() : new ArrayList<>())
            .build();

    // Lưu ảnh nếu có
    if (imageFile != null && !imageFile.isEmpty()) {
        String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
        Path uploadPath = Paths.get("C:/Users/hieud/Desktop/Ogcamping/backendOG/uploads/services");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        imageFile.transferTo(filePath.toFile());

        service.setImageUrl("/uploads/services/" + fileName); // đường dẫn relative
    }

    // Lưu service vào DB
    service = serviceRepository.save(service);

    // Lưu itinerary nếu có
    if (req.getItinerary() != null) {
        final Service finalService = service; // biến final
        List<ItineraryItem> items = req.getItinerary().stream().map(i -> {
            return ItineraryItem.builder()
                    .day(i.getDay())
                    .title(i.getTitle())
                    .activities(i.getActivities())
                    .service(finalService)
                    .build();
        }).toList();
        if (service.getItinerary() == null) {
            service.setItinerary(new ArrayList<>());
        }
        service.getItinerary().addAll(items);
        service = serviceRepository.save(service);
    }


    // Trả về DTO
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
        service.setTag(ServiceTag.valueOf(req.getTag().name()));

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
        List<ItineraryDTO> itineraryDTOs = new ArrayList<>();
        if (service.getItinerary() != null) {
            itineraryDTOs = service.getItinerary().stream()
                    .map(item -> ItineraryDTO.builder()
                            .day(item.getDay())
                            .title(item.getTitle())
                            .activities(item.getActivities()) // nếu activities là List<String>
                            .build())
                    .toList();
        }

        return ServiceResponseDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .price(service.getPrice())
                .location(service.getLocation())
                .minDays(service.getMinDays())
                .maxDays(service.getMaxDays())
                .duration(service.getMinDays() + "-" + service.getMaxDays() + " ngày")
                .minCapacity(service.getMinCapacity())
                .maxCapacity(service.getMaxCapacity())
                .capacity(service.getMinCapacity() + "-" + service.getMaxCapacity() + " người")
                .availableSlots(service.getAvailableSlots())
                .averageRating(service.getAverageRating())
                .totalReviews(service.getTotalReviews())
                .tag(service.getTag())
                .imageUrl(service.getImageUrl() != null ? service.getImageUrl()
                        : "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png")
                .highlights(service.getHighlights())
                .included(service.getIncluded())
                .itinerary(itineraryDTOs)
                .build();
    }


}