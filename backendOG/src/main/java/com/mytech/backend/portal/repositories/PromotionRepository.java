// com/mytech/backend/portal/repositories/PromotionRepository.java
package com.mytech.backend.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mytech.backend.portal.models.Promotion;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
}