package com.mytech.backend.portal.apis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.models.Area.AreaName;
import com.mytech.backend.portal.models.Category.CategoryName;
import com.mytech.backend.portal.models.Gear.GearStatus;
import com.mytech.backend.portal.services.GearService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/apis/v1/gears", "/apis/test/gears"})
@RequiredArgsConstructor
public class GearController {

    @Autowired
    private GearService gearService;

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
            // TODO: Lưu file image và set đường dẫn vào dto
        }

        return ResponseEntity.ok(gearService.createGear(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GearDTO> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(gearService.getGearById(id));
    }

    @GetMapping
    public ResponseEntity<List<GearDTO>> getAll() {
        return ResponseEntity.ok(gearService.getAllGears());
    }

    @PutMapping("/{id}")
    public ResponseEntity<GearDTO> update(@PathVariable("id") Long id, @RequestBody GearDTO dto) {
        return ResponseEntity.ok(gearService.updateGear(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        gearService.deleteGear(id);
        return ResponseEntity.noContent().build();
    }
}
