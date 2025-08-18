package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Combo.ComboRequestDTO;
import com.mytech.backend.portal.dto.Combo.ComboResponseDTO;
import com.mytech.backend.portal.services.Combo.ComboService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/apis/v1/combos")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    @PostMapping
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
        return ResponseEntity.ok(comboService.getCombo(id));
    }

    @GetMapping
    public ResponseEntity<List<ComboResponseDTO>> getAllCombos() {
        return ResponseEntity.ok(comboService.getAllCombos());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(@PathVariable Long id) {
        comboService.deleteCombo(id);
        return ResponseEntity.noContent().build();
    }
}
