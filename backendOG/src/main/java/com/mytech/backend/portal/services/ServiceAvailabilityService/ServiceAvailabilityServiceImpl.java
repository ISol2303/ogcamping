package com.mytech.backend.portal.services.ServiceAvailabilityService;

import com.mytech.backend.portal.dto.Service.AvailabilityBatchRequest;
import com.mytech.backend.portal.dto.Service.ServiceAvailabilityDTO;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.models.Service.ServiceAvailability;
import com.mytech.backend.portal.repositories.ServiceAvailabilityRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceAvailabilityServiceImpl implements ServiceAvailabilityService {

    private final ServiceRepository serviceRepository;
    private final ServiceAvailabilityRepository availabilityRepository;

    @Override
    public ServiceAvailabilityDTO createAvailability(Long serviceId, ServiceAvailabilityDTO dto) {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Check nếu ngày đó đã có config rồi
        Optional<ServiceAvailability> existing = availabilityRepository.findByServiceIdAndDate(serviceId, dto.getDate());
        if (existing.isPresent()) {
            throw new RuntimeException("Availability already exists for date: " + dto.getDate());
        }

        ServiceAvailability availability = ServiceAvailability.builder()
                .service(service)
                .date(dto.getDate())
                .totalSlots(dto.getTotalSlots())
                .bookedSlots(0) // khi mới tạo thì chưa có ai đặt
                .build();

        availability = availabilityRepository.save(availability);
        return mapToDTO(availability);
    }

    @Override
    public ServiceAvailabilityDTO updateAvailability(Long availabilityId, ServiceAvailabilityDTO dto) {
        ServiceAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        availability.setTotalSlots(dto.getTotalSlots());
        // bookedSlots không update trực tiếp ở đây, chỉ hệ thống booking mới thay đổi
        availability = availabilityRepository.save(availability);

        return mapToDTO(availability);
    }

    @Override
    public void deleteAvailability(Long availabilityId) {
        availabilityRepository.deleteById(availabilityId);
    }

    @Override
    public List<ServiceAvailabilityDTO> getAvailabilityByService(Long serviceId) {
        return availabilityRepository.findAllByServiceId(serviceId)
                .stream().map(this::mapToDTO).toList();
    }

    private ServiceAvailabilityDTO mapToDTO(ServiceAvailability availability) {
        return ServiceAvailabilityDTO.builder()
                .id(availability.getId())
                .date(availability.getDate())
                .totalSlots(availability.getTotalSlots())
                .bookedSlots(availability.getBookedSlots())
                .build();
    }
    // tao truoc
    @Override
    public List<ServiceAvailabilityDTO> createAvailabilityBatch(Long serviceId, AvailabilityBatchRequest request) {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        List<ServiceAvailability> availabilities = new ArrayList<>();

        LocalDate current = request.getStartDate();
        while (!current.isAfter(request.getEndDate())) {
            LocalDate dateToCheck = current;

            // Nếu ngày đã có availability thì bỏ qua (tránh trùng lặp)
            boolean exists = availabilityRepository.findByServiceIdAndDate(serviceId, dateToCheck).isPresent();
            if (!exists) {
                ServiceAvailability availability = ServiceAvailability.builder()
                        .service(service)
                        .date(dateToCheck)
                        .totalSlots(request.getTotalSlots())
                        .bookedSlots(0)
                        .build();
                availabilities.add(availability);
            }

            current = current.plusDays(1);
        }
        List<ServiceAvailability> saved = availabilityRepository.saveAll(availabilities);

        return saved.stream().map(this::mapToDTO).toList();
    }

}
