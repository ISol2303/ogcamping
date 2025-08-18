package com.mytech.backend.portal.services.Combo;

import com.mytech.backend.portal.dto.Combo.ComboRequestDTO;
import com.mytech.backend.portal.dto.Combo.ComboResponseDTO;

import java.util.List;

public interface ComboService {
    ComboResponseDTO createCombo(ComboRequestDTO req);
    ComboResponseDTO updateCombo(Long id, ComboRequestDTO req);
    ComboResponseDTO getCombo(Long id);
    List<ComboResponseDTO> getAllCombos();
    void deleteCombo(Long id); // soft delete: set active=false
}
