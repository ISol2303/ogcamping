package com.mytech.backend.portal.services;

import com.mytech.backend.portal.dto.StatDTO;

import java.util.List;

public interface StatService {
    List<StatDTO> getStats(String period);
}