package com.mytech.backend.portal.services;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.mytech.backend.portal.dto.ServiceRequestDTO;
import com.mytech.backend.portal.dto.ServiceResponseDTO;


public interface ServiceService {

    // Lấy tất cả dịch vụ
    List<ServiceResponseDTO> getAllServices();

    // Lấy chi tiết 1 service theo id
    ServiceResponseDTO getServiceById(Long id);

    // Tạo service mới
    ServiceResponseDTO createService(ServiceRequestDTO dto, MultipartFile imageFile) throws IOException;


    // Cập nhật service
    ServiceResponseDTO updateService(Long id, ServiceRequestDTO req);

    // Lấy dịch vụ theo tag (POPULAR, NEW, DISCOUNT)
    List<ServiceResponseDTO> getServicesByTag(String tag);

    // Xóa service (hoặc set active=false)
    void deleteService(Long id);

}