package com.mytech.backend.portal.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.models.Area.AreaName;
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

    @Override
    public GearDTO createGear(GearDTO dto) {
        try {
            System.out.println("Creating gear in service with DTO: " + dto);
            
            // Tạo gear mới thay vì dùng ModelMapper
            Gear gear = new Gear();
            gear.setName(dto.getName());
            gear.setCategory(dto.getCategory());
            gear.setArea(dto.getArea());
            gear.setDescription(dto.getDescription());
            gear.setQuantityInStock(dto.getQuantityInStock());
            gear.setAvailable(dto.getAvailable());
            gear.setPricePerDay(dto.getPricePerDay());
            gear.setStatus(dto.getStatus());
            gear.setImage(dto.getImage());
            
            // Set timestamps
            LocalDateTime now = LocalDateTime.now();
            gear.setCreatedOn(now);
            gear.setUpdatedOn(now);
            
            // Tự động cập nhật status dựa trên available quantity
            updateGearStatusBasedOnAvailable(gear);
            
            System.out.println("Created gear: " + gear);
            
            Gear savedGear = gearRepository.save(gear);
            System.out.println("Saved gear: " + savedGear);
            
            GearDTO result = modelMapper.map(savedGear, GearDTO.class);
            System.out.println("Result DTO: " + result);
            
            return result;
        } catch (Exception e) {
            System.err.println("Error in createGear service: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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
        try {
            System.out.println("Updating gear in service with ID: " + id);
            System.out.println("DTO: " + dto);
            
            // Tìm gear hiện tại
            Gear existingGear = gearRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Gear not found with id: " + id));
            
            System.out.println("Existing gear: " + existingGear);
            
            // Cập nhật từng field thay vì dùng ModelMapper
            // KHÔNG set ID và version - để Hibernate tự quản lý
            existingGear.setName(dto.getName());
            existingGear.setCategory(dto.getCategory());
            existingGear.setArea(dto.getArea());
            existingGear.setDescription(dto.getDescription());
            existingGear.setQuantityInStock(dto.getQuantityInStock());
            existingGear.setAvailable(dto.getAvailable());
            existingGear.setPricePerDay(dto.getPricePerDay());
            existingGear.setStatus(dto.getStatus());
            
            // Chỉ cập nhật image nếu có
            if (dto.getImage() != null && !dto.getImage().isEmpty()) {
                existingGear.setImage(dto.getImage());
            }
            
            // Set updatedOn timestamp
            existingGear.setUpdatedOn(LocalDateTime.now());
            
            // Tự động cập nhật status dựa trên available quantity
            updateGearStatusBasedOnAvailable(existingGear);
            
            System.out.println("Updated gear: " + existingGear);
            
            Gear savedGear = gearRepository.save(existingGear);
            System.out.println("Saved gear: " + savedGear);
            
            GearDTO result = modelMapper.map(savedGear, GearDTO.class);
            System.out.println("Result DTO: " + result);
            
            return result;
        } catch (Exception e) {
            System.err.println("Error in updateGear service: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public void deleteGear(Long id) {
        gearRepository.deleteById(id);
    }
    
    
    @Override
	public List<GearDTO> findAll() {
		return gearRepository.findAll().stream()
				.map(gear -> modelMapper.map(gear, GearDTO.class))
				.collect(Collectors.toList());
	}
	
	@Override
	public List<GearDTO> searchGears(String name, String category, AreaName area, GearStatus status) {
		return gearRepository.searchGears(name, category, area, status).stream()
				.map(gear -> modelMapper.map(gear, GearDTO.class))
				.collect(Collectors.toList());
	}
	
	/**
	 * Tự động cập nhật status của gear dựa trên available quantity
	 */
	private void updateGearStatusBasedOnAvailable(Gear gear) {
		if (gear.getAvailable() == null || gear.getAvailable() <= 0) {
			gear.setStatus(GearStatus.OUT_OF_STOCK);
			System.out.println("Updated gear " + gear.getId() + " status to OUT_OF_STOCK (available: " + gear.getAvailable() + ")");
		} else {
			gear.setStatus(GearStatus.AVAILABLE);
			System.out.println("Updated gear " + gear.getId() + " status to AVAILABLE (available: " + gear.getAvailable() + ")");
		}
	}
	
	@Override
	public void updateGearStatusBasedOnAvailable() {
		System.out.println("Updating all gear statuses based on available quantity...");
		List<Gear> allGears = gearRepository.findAll();
		boolean hasChanges = false;
		
		for (Gear gear : allGears) {
			GearStatus oldStatus = gear.getStatus();
			updateGearStatusBasedOnAvailable(gear);
			
			if (!oldStatus.equals(gear.getStatus())) {
				hasChanges = true;
				gear.setUpdatedOn(LocalDateTime.now());
			}
		}
		
		if (hasChanges) {
			gearRepository.saveAll(allGears);
			System.out.println("Updated " + allGears.size() + " gear statuses");
		} else {
			System.out.println("No gear status updates needed");
		}
	}
	
	@Override
	public GearDTO updateGearAvailableQuantity(Long gearId, Integer quantityChange) {
		try {
			System.out.println("Updating gear " + gearId + " available quantity by " + quantityChange);
			
			Gear gear = gearRepository.findById(gearId)
					.orElseThrow(() -> new RuntimeException("Gear not found with id: " + gearId));
			
			// Cập nhật available quantity
			Integer newAvailable = gear.getAvailable() + quantityChange;
			
			// Đảm bảo không âm và không vượt quá quantityInStock
			newAvailable = Math.max(0, newAvailable);
			newAvailable = Math.min(newAvailable, gear.getQuantityInStock());
			
			gear.setAvailable(newAvailable);
			gear.setUpdatedOn(LocalDateTime.now());
			
			// Tự động cập nhật status dựa trên available quantity
			updateGearStatusBasedOnAvailable(gear);
			
			Gear savedGear = gearRepository.save(gear);
			System.out.println("Updated gear " + gearId + " available quantity to " + newAvailable + ", status: " + savedGear.getStatus());
			
			return modelMapper.map(savedGear, GearDTO.class);
		} catch (Exception e) {
			System.err.println("Error updating gear available quantity: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}
}
