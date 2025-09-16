package com.mytech.backend.portal.apis;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mytech.backend.portal.dto.DishRequestDTO;
import com.mytech.backend.portal.dto.DishResponseDTO;
import com.mytech.backend.portal.models.Dish;
import com.mytech.backend.portal.repositories.DishRepository;
import com.mytech.backend.portal.services.DishService;

@RestController
@RequestMapping("/apis/dishes")
public class DishController {

    @Autowired
    private DishService dishService;

    @Autowired
    private DishRepository dishRepository;

    private final String UPLOAD_DIR = "static/images";

    @GetMapping("/all")
    public List<DishResponseDTO> getAll() {
        return dishService.getAll();
    }

    @GetMapping("/{id}")
    public DishResponseDTO getById(@PathVariable Long id) {
        return dishService.getById(id);
    }

    @PostMapping("/create")
    public DishResponseDTO create(@RequestBody DishResponseDTO dto) {
        return dishService.create(dto);
    }

    @PostMapping("/createWithImage")
    public ResponseEntity<?> createDish(
            @ModelAttribute DishRequestDTO dto,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            // 1. Kiểm tra thông tin bắt buộc
            if (dto.getName() == null || dto.getName().isBlank()
                || dto.getPrice() <= 0
                || dto.getQuantity() <= 0
                || dto.getCategory() == null || dto.getCategory().isBlank()) {

                return ResponseEntity.badRequest().body("Vui lòng điền đầy đủ thông tin món ăn!");
            }

            // 2. Kiểm tra category hợp lệ
            String categoryUpper = dto.getCategory().toUpperCase();
            if (!List.of("BBQ", "HOTPOT", "SNACK", "DRINK").contains(categoryUpper)) {
                return ResponseEntity.badRequest()
                        .body("Category không hợp lệ! Chọn một trong: HOTPOT, BBQ, SNACK, DRINK");
            }

            // 3. Xử lý file ảnh (chỉ lưu 1 lần vào thư mục uploads/)
            String fileName = null;
            if (file != null && !file.isEmpty()) {
                fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path path = Paths.get("uploads/" + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, file.getBytes());
            }

            // 4. Tạo Dish entity
            Dish dish = new Dish();
            dish.setName(dto.getName());
            dish.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
            dish.setPrice(dto.getPrice());
            dish.setQuantity(dto.getQuantity());
            dish.setCategory(categoryUpper);
            dish.setImageUrl(fileName != null ? "/uploads/" + fileName : null); // chỉ set 1 lần
            if (dish.getQuantity() <= 0) {
                dish.setStatus("SOLD_OUT");
            } else {
                dish.setStatus("AVAILABLE");
            }
            // 5. Lưu dish
            dishRepository.save(dish);

            return ResponseEntity.ok(dish);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error saving dish");
        }
    }




    @PostMapping("/uploadImage/{id}")
    public ResponseEntity<DishResponseDTO> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dish not found with id: " + id));

        // tạo thư mục nếu chưa có
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();

        // tạo tên file duy nhất
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String filepath = Paths.get(UPLOAD_DIR, filename).toString();

        // lưu file
        file.transferTo(new File(filepath));

        // update imageUrl
        dish.setImageUrl("/images/" + filename);
        Dish updated = dishRepository.save(dish);

        // map sang DTO
        DishResponseDTO response = DishResponseDTO.builder()
                .id(updated.getId())
                .name(updated.getName())
                .description(updated.getDescription())
                .price(updated.getPrice())
                .quantity(updated.getQuantity())
                .category(updated.getCategory())
                .imageUrl(updated.getImageUrl())
                .status(dish.getStatus())
                .build();

        return ResponseEntity.ok(response);
    }
    ///edit dish
    @PutMapping("edit/{id}")
    public ResponseEntity<?> editDish(
            @PathVariable("id") Long id,
            @RequestBody DishRequestDTO dto) {

        return dishRepository.findById(id).map(dish -> {
            dish.setName(dto.getName());
            dish.setDescription(dto.getDescription());
            dish.setPrice(dto.getPrice());
            dish.setQuantity(dto.getQuantity());
            dish.setCategory(dto.getCategory().toUpperCase());
            dishRepository.save(dish);
            return ResponseEntity.ok(dish);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("editImage/{id}")
    public ResponseEntity<?> editDishImage(
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file) {

        return dishRepository.findById(id).map(dish -> {
            try {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path path = Paths.get("uploads/" + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, file.getBytes());

                dish.setImageUrl("/uploads/" + fileName);
                dishRepository.save(dish);

                return ResponseEntity.ok(dish);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload image failed");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update/{id}")
    public DishResponseDTO update(@PathVariable("id") Long id, @RequestBody DishResponseDTO dto) {
        return dishService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) {
        dishService.delete(id);
    }

    @PostMapping("/batch")
    public List<DishResponseDTO> createBatch(@RequestBody List<DishRequestDTO> dtos) {
        return dishService.createBatch(dtos);
    }
    
}
