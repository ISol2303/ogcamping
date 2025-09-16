package com.mytech.backend.portal.services.Combo;

import com.mytech.backend.portal.dto.Combo.ComboItemResponseDTO;
import com.mytech.backend.portal.dto.Combo.ComboRequestDTO;
import com.mytech.backend.portal.dto.Combo.ComboResponseDTO;
import com.mytech.backend.portal.dto.Combo.ComboServiceDTO;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Combo.ComboItem;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.repositories.ComboRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ComboServiceImpl implements ComboService {

    private final ComboRepository comboRepository;
    private final ServiceRepository serviceRepository;

    private final String uploadDir = "C:/Users/Admin/OneDrive/Desktop/ogcamping/backendOG/uploads/combos"; // thư mục lưu ảnh

    @Override
    public ComboResponseDTO createCombo(ComboRequestDTO request, MultipartFile imageFile) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveFile(imageFile);
        }

        Combo combo = Combo.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .discount(request.getDiscount())
                .active(request.getActive())
                .imageUrl(imageUrl)
                .location(request.getLocation())
                .duration(request.getDuration())
                .minPeople(request.getMinPeople())
                .maxPeople(request.getMaxPeople())
                .minDays(request.getMinDays())
                .maxDays(request.getMaxDays())
                .highlights(request.getHighlights())
                .tags(request.getTags())
                .rating(0.0)
                .reviewCount(0)

                .build();

        List<ComboItem> items = request.getServices().stream().map(s -> {
            Service service = serviceRepository.findById(s.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found: " + s.getServiceId()));
            return ComboItem.builder()
                    .combo(combo)
                    .service(service)
                    .quantity(s.getQuantity())
                    .build();
        }).toList();
        combo.setItems(items);
        Combo saved = comboRepository.save(combo);
        return mapToResponse(saved, request.getEquipment(), request.getFoods());
    }


    // ================= UPDATE COMBO =================
    @Override
    @Transactional
    public ComboResponseDTO updateCombo(Long id, ComboRequestDTO request, MultipartFile imageFile) {
        Combo existing = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found with id: " + id));

        // cập nhật ảnh
        String imageUrl = existing.getImageUrl();
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveFile(imageFile);
        }

        // cập nhật các field
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setOriginalPrice(request.getOriginalPrice());
        existing.setDiscount(request.getDiscount());
        existing.setActive(request.getActive());
        existing.setImageUrl(imageUrl);
        existing.setLocation(request.getLocation());
        existing.setDuration(request.getDuration());
        existing.setMinPeople(request.getMinPeople());
        existing.setMaxPeople(request.getMaxPeople());
        existing.setMinDays(request.getMinDays());
        existing.setMaxDays(request.getMaxDays());
        existing.setHighlights(request.getHighlights());
        existing.setTags(request.getTags());

        // cập nhật items (xóa cũ, thêm mới)
        existing.getItems().clear();
        List<ComboItem> items = request.getServices().stream().map(s -> {
            Service service = serviceRepository.findById(s.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found: " + s.getServiceId()));
            return ComboItem.builder()
                    .combo(existing)
                    .service(service)
                    .quantity(s.getQuantity())
                    .build();
        }).toList();
        existing.getItems().addAll(items);

        Combo saved = comboRepository.save(existing);
        return mapToResponse(saved, request.getEquipment(), request.getFoods());
    }




    // ================= DELETE COMBO =================
    @Override
    public void deleteCombo(Long id) {
        comboRepository.deleteById(id);
    }

    // ================= GET ONE COMBO =================
    @Override
    public ComboResponseDTO getCombo(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        // Mock devices & foods nếu muốn
        return mapToResponse(combo,
                List.of("MockDevice1", "MockDevice2"),
                List.of("MockFood1", "MockFood2"));
    }

    // ================= GET ALL COMBOS =================
    @Override
    public List<ComboResponseDTO> getAllCombos() {
        return comboRepository.findAll().stream()
                .map(c -> mapToResponse(c, List.of("MockDevice1"), List.of("MockFood1")))
                .toList();
    }

    // ================= HELPER METHODS =================
    private ComboResponseDTO mapToResponse(Combo combo, List<String> equipment, List<String> foods) {
        List<ComboItemResponseDTO> itemResponses = combo.getItems().stream()
                .map(ci -> new ComboItemResponseDTO(
                        ci.getService().getId(),
                        ci.getService().getName(),
                        ci.getQuantity(),
                        ci.getService().getPrice()
                ))
                .toList();

        return ComboResponseDTO.builder()
                .id(combo.getId())
                .name(combo.getName())
                .description(combo.getDescription())
                .price(combo.getPrice())
                .originalPrice(combo.getOriginalPrice())
                .discount(combo.getDiscount())
                .imageUrl(combo.getImageUrl())
                .active(combo.getActive())
                .rating(combo.getRating())
                .reviewCount(combo.getReviewCount())
                .location(combo.getLocation())
                .duration(combo.getDuration())
                .minDays(combo.getMinDays())
                .maxDays(combo.getMaxDays())
                .minPeople(combo.getMinPeople())
                .maxPeople(combo.getMaxPeople())
                .highlights(combo.getHighlights())
                .tags(combo.getTags())
                .items(itemResponses)
                .equipment(equipment)
                .foods(foods)
                .build();
    }


    private String saveFile(MultipartFile file) {
        try {
            String fileExtension = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                fileExtension = originalName.substring(originalName.lastIndexOf("."));
            }

            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            Path dirPath = Paths.get(uploadDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            Path filePath = dirPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/combos/" + uniqueFileName;

        } catch (IOException e) {
            throw new RuntimeException("Error saving file", e);
        }
    }
}
