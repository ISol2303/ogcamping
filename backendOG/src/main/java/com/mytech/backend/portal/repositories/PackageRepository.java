package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
}
