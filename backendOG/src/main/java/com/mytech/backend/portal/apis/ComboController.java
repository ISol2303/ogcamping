package com.mytech.backend.portal.apis;

<<<<<<< HEAD
=======
import com.fasterxml.jackson.databind.ObjectMapper;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
import com.mytech.backend.portal.dto.Combo.ComboRequestDTO;
import com.mytech.backend.portal.dto.Combo.ComboResponseDTO;
import com.mytech.backend.portal.services.Combo.ComboService;
import lombok.RequiredArgsConstructor;
<<<<<<< HEAD
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
=======
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
>>>>>>> 4b112d9 (Add or update frontend & backend code)

import java.util.List;

@RestController
@RequestMapping("/apis/v1/combos")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    @PostMapping
<<<<<<< HEAD
    public ResponseEntity<ComboResponseDTO> createCombo(@RequestBody ComboRequestDTO req) {
        return ResponseEntity.ok(comboService.createCombo(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComboResponseDTO> updateCombo(@PathVariable Long id,
                                                        @RequestBody ComboRequestDTO req) {
        return ResponseEntity.ok(comboService.updateCombo(id, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboResponseDTO> getCombo(@PathVariable Long id) {
=======
    public ResponseEntity<ComboResponseDTO> createCombo(
            @RequestPart("combo") String comboJson,
            @RequestPart(value = "imageFile", required = true) MultipartFile imageFile
    ) throws Exception {
        // Parse JSON sang DTO
        ObjectMapper objectMapper = new ObjectMapper();
        ComboRequestDTO dto = objectMapper.readValue(comboJson, ComboRequestDTO.class);

        // Gọi service xử lý
        ComboResponseDTO response = comboService.createCombo(dto, imageFile);

        return ResponseEntity.ok(response);
    }




    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComboResponseDTO> update(
            @PathVariable Long id,
            @RequestPart("data") ComboRequestDTO request,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        return ResponseEntity.ok(comboService.updateCombo(id, request, imageFile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        comboService.deleteCombo(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboResponseDTO> getOne(@PathVariable Long id) {
>>>>>>> 4b112d9 (Add or update frontend & backend code)
        return ResponseEntity.ok(comboService.getCombo(id));
    }

    @GetMapping
<<<<<<< HEAD
    public ResponseEntity<List<ComboResponseDTO>> getAllCombos() {
        return ResponseEntity.ok(comboService.getAllCombos());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(@PathVariable Long id) {
        comboService.deleteCombo(id);
        return ResponseEntity.noContent().build();
    }
}
=======
    public ResponseEntity<List<ComboResponseDTO>> getAll() {
        return ResponseEntity.ok(comboService.getAllCombos());
    }
}

>>>>>>> 4b112d9 (Add or update frontend & backend code)
