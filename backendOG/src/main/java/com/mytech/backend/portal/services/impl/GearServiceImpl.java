package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.dto.InventoryDTO;
import com.mytech.backend.portal.models.Area.AreaName;
import com.mytech.backend.portal.models.Category.CategoryName;
import com.mytech.backend.portal.models.Gear;
import com.mytech.backend.portal.models.Gear.GearStatus;
import com.mytech.backend.portal.repositories.GearRepository;
import com.mytech.backend.portal.services.GearService;

import lombok.RequiredArgsConstructor;

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

	@Override
	public List<InventoryDTO> findInventory() {
		// Map Gear entities to InventoryDTO based on quantityInStock and available fields
        return gearRepository.findAll().stream()
                .filter(gear -> gear.getQuantityInStock() != null) // Filter for items with stock information
                .map(gear -> {
                    InventoryDTO inventoryDTO = new InventoryDTO();
                    inventoryDTO.setId(gear.getId());
                    inventoryDTO.setName(gear.getName());
                    inventoryDTO.setQuantity(gear.getQuantityInStock()); // Use quantityInStock as the current stock
                    inventoryDTO.setThreshold(calculateThreshold(gear.getQuantityInStock(), gear.getTotal())); // Default threshold logic
                    inventoryDTO.setStatus(determineInventoryStatus(gear.getQuantityInStock(), inventoryDTO.getThreshold()));
                    return inventoryDTO;
                })
                .collect(Collectors.toList());
    }

    private int calculateThreshold(int quantityInStock, Integer total) {
        // Simple threshold logic: 20% of total or 5 units, whichever is higher
        int defaultThreshold = total != null && total > 0 ? (int) (total * 0.2) : 5;
        return Math.max(defaultThreshold, 5);
    }

    private String determineInventoryStatus(int quantity, int threshold) {
        if (quantity <= 0) return "out_of_stock";
        if (quantity <= threshold) return "low";
        return "sufficient";
    }

    private GearDTO convertToGearDTO(Gear gear) {
        GearDTO dto = new GearDTO();
        dto.setId(gear.getId());
        dto.setName(gear.getName());
        dto.setCategory(gear.getCategory());
        dto.setArea(gear.getArea());
        dto.setDescription(gear.getDescription());
        dto.setQuantityInStock(gear.getQuantityInStock());
        dto.setImage(gear.getImage());
        dto.setAvailable(gear.getAvailable());
        dto.setPricePerDay(gear.getPricePerDay());
        dto.setTotal(gear.getTotal());
        dto.setStatus(gear.getStatus());
        dto.setCreatedAt(gear.getCreatedAt());
        return dto;
    }
}
