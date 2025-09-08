package com.mytech.backend.portal.services.Service;


import com.mytech.backend.portal.dto.Service.ItineraryDTO;
import com.mytech.backend.portal.dto.Service.ServiceAvailabilityDTO;
import com.mytech.backend.portal.dto.Service.ServiceRequestDTO;
import com.mytech.backend.portal.dto.Service.ServiceResponseDTO;
import com.mytech.backend.portal.models.Service.ItineraryItem;
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
import java.util.ArrayList;
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
    public ServiceResponseDTO createService(ServiceRequestDTO req, MultipartFile imageFile, MultipartFile[] extraImages   ) throws IOException {
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
                .isExperience(false)
                .defaultSlotsPerDay(req.getDefaultSlotsPerDay())
                .averageRating(0.0)
                .totalReviews(0)
                .duration(req.getDuration())
                .capacity(req.getCapacity())
                .tag(ServiceTag.valueOf(req.getTag().name()))
                .highlights(req.getHighlights() != null ? req.getHighlights() : new ArrayList<>())
                .included(req.getIncluded() != null ? req.getIncluded() : new ArrayList<>())
                .build();

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
            Path uploadPath = Paths.get("C:/Users/Admin/OneDrive/Desktop/ogcamping/backendOG/uploads/services");
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(fileName);
            imageFile.transferTo(filePath.toFile());
            service.setImageUrl("/uploads/services/" + fileName);
        }

// 2. Lưu ảnh phụ
        List<String> extraImageUrls = new ArrayList<>();
        if (extraImages != null) {
            for (MultipartFile file : extraImages) {
                if (!file.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path uploadPath = Paths.get("C:/Users/Admin/OneDrive/Desktop/ogcamping/backendOG/uploads/services");
                    if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
                    Path filePath = uploadPath.resolve(fileName);
                    file.transferTo(filePath.toFile());
                    extraImageUrls.add("/uploads/services/" + fileName);
                }
            }
        }
        service.setExtraImageUrls(extraImageUrls); // danh sách ảnh phụ

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
                        .service(finalService) // dùng biến final
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
    @Transactional
    public ServiceResponseDTO updateService(Long id,
                                            ServiceRequestDTO req,
                                            MultipartFile imageFile,
                                            MultipartFile[] extraImages) throws IOException {

        // 1. Tìm service cần cập nhật
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // 2. Cập nhật các trường cơ bản
        service.setName(req.getName());
        service.setDescription(req.getDescription());
        service.setPrice(req.getPrice());
        service.setLocation(req.getLocation());
        service.setMinDays(req.getMinDays());
        service.setMaxDays(req.getMaxDays());
        service.setMinCapacity(req.getMinCapacity());
        service.setMaxCapacity(req.getMaxCapacity());
        service.setDefaultSlotsPerDay(req.getDefaultSlotsPerDay());
        service.setDuration(req.getDuration());
        service.setCapacity(req.getCapacity());
        service.setTag(ServiceTag.valueOf(req.getTag().name()));
        service.setHighlights(req.getHighlights() != null ? req.getHighlights() : new ArrayList<>());
        service.setIncluded(req.getIncluded() != null ? req.getIncluded() : new ArrayList<>());

        // 3. Cập nhật ảnh chính (nếu có ảnh mới)
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
            Path uploadPath = Paths.get("C:/Users/Admin/OneDrive/Desktop/ogcamping/backendOG/uploads/services");
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(fileName);
            imageFile.transferTo(filePath.toFile());
            service.setImageUrl("/uploads/services/" + fileName);
        }

        // 4. Cập nhật ảnh phụ
        List<String> extraImageUrls = new ArrayList<>();
        if (extraImages != null) {
            for (MultipartFile file : extraImages) {
                if (!file.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path uploadPath = Paths.get("C:/Users/Admin/OneDrive/Desktop/ogcamping/backendOG/uploads/services");
                    if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
                    Path filePath = uploadPath.resolve(fileName);
                    file.transferTo(filePath.toFile());
                    extraImageUrls.add("/uploads/services/" + fileName);
                }
            }
        }
        service.setExtraImageUrls(extraImageUrls);

        // 5. Cập nhật itinerary
        if (req.getItinerary() != null) {
            // Xóa toàn bộ itinerary cũ
            if (service.getItinerary() != null) {
                service.getItinerary().clear();
            } else {
                service.setItinerary(new ArrayList<>());
            }

            // Thêm itinerary mới
            List<ItineraryItem> items = new ArrayList<>();
            for (ItineraryDTO i : req.getItinerary()) {
                ItineraryItem item = ItineraryItem.builder()
                        .day(i.getDay())
                        .title(i.getTitle())
                        .activities(i.getActivities())
                        .service(service)
                        .build();
                items.add(item);
            }

            service.getItinerary().addAll(items);
        }

        // 6. Lưu thay đổi vào DB
        service = serviceRepository.save(service);

        // 7. Trả về DTO
        return mapToDTO(service);
    }


    private String uploadImage(MultipartFile file) {
        // Ví dụ lưu local
        String uploadDir = "/uploads/services/";
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir + filename);
        try {
            Files.createDirectories(path.getParent());
            file.transferTo(path.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
        return "/uploads/services/" + filename; // URL có thể trả về frontend
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
        // Map itinerary
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

        // Map availability
        List<ServiceAvailabilityDTO> availabilityDTOs = new ArrayList<>();
        if (service.getAvailability() != null) {
            availabilityDTOs = service.getAvailability().stream()
                    .map(a -> ServiceAvailabilityDTO.builder()
                            .id(a.getId())
                            .date(a.getDate())
                            .totalSlots(a.getTotalSlots())
                            .bookedSlots(a.getBookedSlots())
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
                .isExperience(service.getIsExperience())
                .active(service.getActive())
                .duration(service.getMinDays() + "-" + service.getMaxDays() + " ngày")
                .minCapacity(service.getMinCapacity())
                .maxCapacity(service.getMaxCapacity())
                .capacity(service.getMinCapacity() + "-" + service.getMaxCapacity() + " người")
                .averageRating(service.getAverageRating())
                .totalReviews(service.getTotalReviews())
                .tag(service.getTag())
                .imageUrl(service.getImageUrl() != null ? service.getImageUrl()
                        : "/uploads/services/default.png")
                .extraImageUrls(service.getExtraImageUrls() != null ? service.getExtraImageUrls() : new ArrayList<>())
                .highlights(service.getHighlights() != null ? service.getHighlights() : new ArrayList<>())
                .included(service.getIncluded() != null ? service.getIncluded() : new ArrayList<>())
                .itinerary(itineraryDTOs)
                .extraFeePerPerson(service.getExtraFeePerPerson())
                .maxExtraPeople(service.getMaxExtraPeople())
                .allowExtraPeople(service.getAllowExtraPeople())
                .requireAdditionalSiteIfOver(service.getRequireAdditionalSiteIfOver())
                .availability(availabilityDTOs)
                .build();
    }



}