// com/mytech/backend/portal/service/PromotionService.java
package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.PromotionDTO;

public interface PromotionService {
    List<PromotionDTO> findAll();
    PromotionDTO createPromotion(PromotionDTO promotionDTO);
}