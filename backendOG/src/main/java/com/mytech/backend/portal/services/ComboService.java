package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.ComboRequestDTO;
import com.mytech.backend.portal.dto.ComboResponseDTO;

public interface ComboService {
    ComboResponseDTO createCombo(ComboRequestDTO req);
    ComboResponseDTO updateCombo(Long id, ComboRequestDTO req);
    ComboResponseDTO getCombo(Long id);
    List<ComboResponseDTO> getAllCombos();
    void deleteCombo(Long id); // soft delete: set active=false
}
