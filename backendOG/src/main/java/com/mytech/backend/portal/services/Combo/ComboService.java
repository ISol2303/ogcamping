package com.mytech.backend.portal.services.Combo;

import com.mytech.backend.portal.dto.Combo.ComboRequestDTO;
import com.mytech.backend.portal.dto.Combo.ComboResponseDTO;
<<<<<<< HEAD
=======
import org.springframework.web.multipart.MultipartFile;
>>>>>>> 4b112d9 (Add or update frontend & backend code)

import java.util.List;

public interface ComboService {
<<<<<<< HEAD
    ComboResponseDTO createCombo(ComboRequestDTO req);
    ComboResponseDTO updateCombo(Long id, ComboRequestDTO req);
    ComboResponseDTO getCombo(Long id);
    List<ComboResponseDTO> getAllCombos();
    void deleteCombo(Long id); // soft delete: set active=false
}
=======
    ComboResponseDTO createCombo(ComboRequestDTO request, MultipartFile imageFile);
    ComboResponseDTO updateCombo(Long id, ComboRequestDTO request, MultipartFile imageFile);
    void deleteCombo(Long id);
    ComboResponseDTO getCombo(Long id);
    List<ComboResponseDTO> getAllCombos();
}

>>>>>>> 4b112d9 (Add or update frontend & backend code)
