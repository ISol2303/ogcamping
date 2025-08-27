// com/mytech/backend/portal/service/impl/PromotionServiceImpl.java
package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.PromotionDTO;
import com.mytech.backend.portal.models.Promotion;
import com.mytech.backend.portal.repositories.PromotionRepository;
import com.mytech.backend.portal.services.PromotionService;

@Service
public class PromotionServiceImpl implements PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Override
    public List<PromotionDTO> findAll() {
        return promotionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PromotionDTO createPromotion(PromotionDTO promotionDTO) {
        Promotion promotion = convertToEntity(promotionDTO);
        promotion = promotionRepository.save(promotion);
        return convertToDTO(promotion);
    }

    private PromotionDTO convertToDTO(Promotion promotion) {
        PromotionDTO dto = new PromotionDTO();
        dto.setId(promotion.getId());
        dto.setCode(promotion.getCode());
        dto.setDiscount(promotion.getDiscount());
        dto.setStartDate(promotion.getStartDate());
        dto.setEndDate(promotion.getEndDate());
        dto.setStatus(promotion.getStatus());
        return dto;
    }

    private Promotion convertToEntity(PromotionDTO dto) {
        Promotion promotion = new Promotion();
        promotion.setId(dto.getId());
        promotion.setCode(dto.getCode());
        promotion.setDiscount(dto.getDiscount());
        promotion.setStartDate(dto.getStartDate());
        promotion.setEndDate(dto.getEndDate());
        promotion.setStatus(dto.getStatus());
        return promotion;
    }
}