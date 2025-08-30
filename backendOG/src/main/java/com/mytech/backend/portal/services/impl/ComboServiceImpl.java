package com.mytech.backend.portal.services.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mytech.backend.portal.dto.ComboRequestDTO;
import com.mytech.backend.portal.dto.ComboResponseDTO;
import com.mytech.backend.portal.models.Combo;
import com.mytech.backend.portal.repositories.ComboRepository;
import com.mytech.backend.portal.services.ComboService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ComboServiceImpl implements ComboService {
	@Autowired
    private ComboRepository comboRepository;

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

    @Override
    public ComboResponseDTO getCombo(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
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
        return ComboResponseDTO.builder()
                .id(combo.getId())
                .name(combo.getName())
                .description(combo.getDescription())
                .price(combo.getPrice())
                .active(combo.getActive())
                .build();
    }
}
