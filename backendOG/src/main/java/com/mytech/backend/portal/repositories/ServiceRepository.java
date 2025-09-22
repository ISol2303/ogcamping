package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Service.Service;

import com.mytech.backend.portal.models.Service.ServiceTag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    // Lấy danh sách dịch vụ theo tag
    List<Service> findByTag(ServiceTag tag);

    // Nếu muốn filter theo active
    List<Service> findByActiveTrueAndTag(ServiceTag tag);

    @Query("SELECT DISTINCT s.location FROM Service s WHERE s.location IS NOT NULL")
    List<String> findAllUniqueLocations();
}

