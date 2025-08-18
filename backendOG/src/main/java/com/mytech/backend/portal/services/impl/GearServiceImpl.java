package com.mytech.backend.portal.services.impl;

import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.models.Area.AreaName;
import com.mytech.backend.portal.models.Category.CategoryName;
import com.mytech.backend.portal.models.Gear;
import com.mytech.backend.portal.models.Gear.GearStatus;
import com.mytech.backend.portal.repositories.GearRepository;
import com.mytech.backend.portal.services.GearService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GearServiceImpl implements GearService {
	@Autowired
    private GearRepository gearRepository;
	@Autowired
    private ModelMapper modelMapper;
	private final GearMapper gearMapper = new GearMapper();

    @Override
    public GearDTO createGear(GearDTO dto) {
        Gear gear = modelMapper.map(dto, Gear.class);
        return modelMapper.map(gearRepository.save(gear), GearDTO.class);
    }

    @Override
    public GearDTO getGearById(Long id) {
        return gearRepository.findById(id)
                .map(gear -> modelMapper.map(gear, GearDTO.class))
                .orElse(null);
    }

    @Override
    public List<GearDTO> getAllGears() {
        return gearRepository.findAll().stream()
                .map(gear -> modelMapper.map(gear, GearDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public GearDTO updateGear(Long id, GearDTO dto) {
        Gear gear = modelMapper.map(dto, Gear.class);
        gear.setId(id);
        return modelMapper.map(gearRepository.save(gear), GearDTO.class);
    }

    @Override
    public void deleteGear(Long id) {
        gearRepository.deleteById(id);
    }
    
    private GearDTO mapToDTO(Gear gear) {
        return modelMapper.map(gear, GearDTO.class);
    }

	@Override
	public List<GearDTO> findAll() {
		return gearRepository.findAll()
	            .stream()
	            .map(gear -> mapToDTO(gear))
	            .collect(Collectors.toList());
	}

	@Override
	public List<GearDTO> searchGears(String name, CategoryName category, AreaName area, GearStatus status) {
		 List<Gear> gears = gearRepository.searchGears(
			        (name != null && !name.isEmpty()) ? name : null,
			        category,
			        area,
			        status
			    );

			    return gears.stream()
			            .map(gearMapper::toDTO) // hoặc convert thủ công
			            .toList();
	}
}
