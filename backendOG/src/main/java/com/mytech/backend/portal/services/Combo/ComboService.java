package com.mytech.backend.portal.services.Combo;

import com.mytech.backend.portal.dto.Combo.ComboRequestDTO;
import com.mytech.backend.portal.dto.Combo.ComboResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ComboService {
    ComboResponseDTO createCombo(ComboRequestDTO request, MultipartFile imageFile);
    ComboResponseDTO updateCombo(Long id, ComboRequestDTO request, MultipartFile imageFile);
    void deleteCombo(Long id);
    ComboResponseDTO getCombo(Long id);
    List<ComboResponseDTO> getAllCombos();
}

