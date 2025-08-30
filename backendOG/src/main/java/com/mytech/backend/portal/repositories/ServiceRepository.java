package com.mytech.backend.portal.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mytech.backend.portal.models.Service;
import com.mytech.backend.portal.models.ServiceTag;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    // Lấy danh sách dịch vụ theo tag
    List<Service> findByTag(ServiceTag tag);

    // Nếu muốn filter theo active
    List<Service> findByActiveTrueAndTag(ServiceTag tag);
}

