package com.mytech.backend.portal.services.Combo;

<<<<<<< HEAD
import com.mytech.backend.portal.dto.Combo.ComboRequestDTO;
import com.mytech.backend.portal.dto.Combo.ComboResponseDTO;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.repositories.ComboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ComboServiceImpl implements ComboService {

    private final ComboRepository comboRepository;

    @Override
    public ComboResponseDTO createCombo(ComboRequestDTO req) {
        Combo combo = Combo.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .active(req.getActive() != null ? req.getActive() : true)
                .build();
        combo = comboRepository.save(combo);
        return mapToDTO(combo);
    }

    @Override
    public ComboResponseDTO updateCombo(Long id, ComboRequestDTO req) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
        combo.setName(req.getName());
        combo.setDescription(req.getDescription());
        combo.setPrice(req.getPrice());
        if (req.getActive() != null) combo.setActive(req.getActive());
        return mapToDTO(comboRepository.save(combo));
    }

=======
import com.mytech.backend.portal.dto.Combo.ComboItemResponseDTO;
import com.mytech.backend.portal.dto.Combo.ComboRequestDTO;
import com.mytech.backend.portal.dto.Combo.ComboResponseDTO;
import com.mytech.backend.portal.dto.Combo.ComboServiceDTO;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Combo.ComboItem;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.repositories.ComboRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;
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
    public ComboResponseDTO updateCombo(Long id, ComboRequestDTO request, MultipartFile imageFile) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
        combo.setName(request.getName());
        combo.setDescription(request.getDescription());
        combo.setPrice(request.getPrice());
        combo.setOriginalPrice(request.getOriginalPrice());
        combo.setDiscount(request.getDiscount());
        combo.setActive(request.getActive());
        combo.setLocation(request.getLocation());
        combo.setDuration(request.getDuration());
        combo.setMinPeople(request.getMinPeople());
        combo.setMaxPeople(request.getMaxPeople());

        combo.setHighlights(request.getHighlights());
        combo.setTags(request.getTags());

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = saveFile(imageFile);
            combo.setImageUrl(imageUrl);
        }
        combo.getItems().clear();
        List<ComboItem> items = request.getServices().stream().map(s -> {
            Service service = serviceRepository.findById(s.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found: " + s.getServiceId()));
            return ComboItem.builder()
                    .combo(combo)
                    .service(service)
                    .quantity(s.getQuantity())
                    .build();
        }).toList();
        combo.getItems().addAll(items);
        Combo saved = comboRepository.save(combo);

        return mapToResponse(saved, request.getEquipment(), request.getFoods());
    }


    // ================= DELETE COMBO =================
    @Override
    public void deleteCombo(Long id) {
        comboRepository.deleteById(id);
    }

    // ================= GET ONE COMBO =================
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    @Override
    public ComboResponseDTO getCombo(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
<<<<<<< HEAD
        return mapToDTO(combo);
    }

    @Override
    public List<ComboResponseDTO> getAllCombos() {
        return comboRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public void deleteCombo(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
        combo.setActive(false);
        comboRepository.save(combo);
    }

    private ComboResponseDTO mapToDTO(Combo combo) {
=======

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
                        ci.getQuantity()
                ))
                .toList();

>>>>>>> 4b112d9 (Add or update frontend & backend code)
        return ComboResponseDTO.builder()
                .id(combo.getId())
                .name(combo.getName())
                .description(combo.getDescription())
                .price(combo.getPrice())
<<<<<<< HEAD
                .active(combo.getActive())
                .build();
    }
=======
                .originalPrice(combo.getOriginalPrice())
                .discount(combo.getDiscount())
                .imageUrl(combo.getImageUrl())
                .active(combo.getActive())
                .rating(combo.getRating())
                .reviewCount(combo.getReviewCount())
                .location(combo.getLocation())
                .duration(combo.getDuration())
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
>>>>>>> 4b112d9 (Add or update frontend & backend code)
}
