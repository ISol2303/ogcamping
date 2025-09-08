package com.mytech.backend.portal.services;

import com.mytech.backend.portal.dto.StatDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminService {
    List<StatDTO> getStats(String period);
	List<StatDTO> getStatsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
}