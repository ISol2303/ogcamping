package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Service.ServiceAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceAvailabilityRepository extends JpaRepository<ServiceAvailability, Long> {

    Optional<ServiceAvailability> findByServiceIdAndDate(Long serviceId, LocalDate date);

    List<ServiceAvailability> findAllByServiceIdAndDateBetween(Long serviceId, LocalDate start, LocalDate end);
    List<ServiceAvailability> findAllByServiceId(Long serviceId);
}
