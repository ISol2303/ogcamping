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
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.dto.ComboRequestDTO;
import com.mytech.backend.portal.dto.ComboResponseDTO;
import com.mytech.backend.portal.services.ComboService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/apis/v1/combos")
@RequiredArgsConstructor
public class ComboController {
	@Autowired
    private ComboService comboService;

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
