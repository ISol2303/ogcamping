package com.mytech.backend.portal.apis;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.dto.ApiResponse;
import com.mytech.backend.portal.dto.AreaDTO;
import com.mytech.backend.portal.repositories.AreaRepository;

@RestController
@RequestMapping("/apis/v1/areas")
public class AreaController {

    private final AreaRepository areaRepository;

    public AreaController(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    @GetMapping
    public ApiResponse<List<AreaDTO>> getAreas() {
        try {
            List<AreaDTO> areas = areaRepository.findAll()
                    .stream()
                    .map(a -> new AreaDTO(
                            a.getId(),
                            a.getName().name(), // Enum -> String
                            a.getDescription()
                    ))
                    .collect(Collectors.toList());

            return ApiResponse.success(areas);
        } catch (Exception e) {
            return ApiResponse.error(500, "Failed to fetch areas: " + e.getMessage());
        }
    }
}
