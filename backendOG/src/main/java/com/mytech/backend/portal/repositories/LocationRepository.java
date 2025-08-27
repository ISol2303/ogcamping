// com/mytech/backend/portal/repositories/LocationRepository.java
package com.mytech.backend.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mytech.backend.portal.models.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
}