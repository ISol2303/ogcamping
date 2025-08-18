package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.models.Area.AreaName;
import com.mytech.backend.portal.models.Category.CategoryName;
import com.mytech.backend.portal.models.Gear.GearStatus;
import com.mytech.backend.portal.services.GearService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping({"/apis/v1/gears", "/apis/test/gears"})
@RequiredArgsConstructor
public class GearController {

    @Autowired
    private GearService gearService;

    // Thư mục lưu ảnh (có thể thay bằng config trong application.properties)
    private static final String UPLOAD_DIR = "uploads/gears/";

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<GearDTO> create(
            @RequestParam("name") String name,
            @RequestParam("category") CategoryName category,
            @RequestParam("area") AreaName area,
            @RequestParam("description") String description,
            @RequestParam("quantity_in_stock") int quantityInStock,
            @RequestParam("available") int available,
            @RequestParam("price_per_day") double pricePerDay,
            @RequestParam("status") GearStatus status,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        GearDTO dto = new GearDTO();
        dto.setName(name);
        dto.setCategory(category);
        dto.setArea(area);
        dto.setDescription(description);
        dto.setQuantityInStock(quantityInStock);
        dto.setAvailable(available);
        dto.setPricePerDay(pricePerDay);
        dto.setStatus(status);

        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            dto.setImage(imagePath);
        }

        return ResponseEntity.ok(gearService.createGear(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GearDTO> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(gearService.getGearById(id));
    }

    @GetMapping
    public ResponseEntity<List<GearDTO>> getAll(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "category", required = false) CategoryName category,
            @RequestParam(value = "area", required = false) AreaName area,
            @RequestParam(value = "status", required = false) GearStatus status
    ) {
        if (name != null || category != null || area != null || status != null) {
            return ResponseEntity.ok(gearService.searchGears(name, category, area, status));
        }
        return ResponseEntity.ok(gearService.getAllGears());
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<GearDTO> update(
            @PathVariable("id") Long id,
            @RequestParam("name") String name,
            @RequestParam("category") CategoryName category,
            @RequestParam("area") AreaName area,
            @RequestParam("description") String description,
            @RequestParam("quantity_in_stock") int quantityInStock,
            @RequestParam("available") int available,
            @RequestParam("price_per_day") double pricePerDay,
            @RequestParam("status") GearStatus status,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        GearDTO dto = new GearDTO();
        dto.setName(name);
        dto.setCategory(category);
        dto.setArea(area);
        dto.setDescription(description);
        dto.setQuantityInStock(quantityInStock);
        dto.setAvailable(available);
        dto.setPricePerDay(pricePerDay);
        dto.setStatus(status);

        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            dto.setImage(imagePath);
        }

        return ResponseEntity.ok(gearService.updateGear(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        gearService.deleteGear(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------
    // Hàm phụ trợ lưu ảnh
    // -------------------
    private String saveImage(MultipartFile image) {
        try {
            // Lấy tên file gốc
            String originalFileName = StringUtils.cleanPath(image.getOriginalFilename());

            // Loại bỏ dấu tiếng Việt
            String normalized = java.text.Normalizer.normalize(originalFileName, java.text.Normalizer.Form.NFD);
            normalized = normalized.replaceAll("\\p{M}", ""); // bỏ dấu

            // Tách tên và đuôi file
            String extension = "";
            int dotIndex = normalized.lastIndexOf(".");
            String baseName = normalized;
            if (dotIndex > 0) {
                extension = normalized.substring(dotIndex);
                baseName = normalized.substring(0, dotIndex);
            }

            // Loại bỏ ký tự đặc biệt, thay bằng "_"
            baseName = baseName.replaceAll("[^a-zA-Z0-9-_]", "_");

            // Thêm timestamp để tránh trùng tên
            String safeFileName = baseName + "_" + System.currentTimeMillis() + extension.toLowerCase();

            // Tạo thư mục nếu chưa có
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Lưu file
            Path filePath = uploadPath.resolve(safeFileName);
            Files.copy(image.getInputStream(), filePath);

            // Trả về đường dẫn public
            return "/" + UPLOAD_DIR + safeFileName;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu file ảnh: " + e.getMessage(), e);
        }
    }
}
