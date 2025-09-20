package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Service.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    void deleteByServiceId(Long serviceId);
}