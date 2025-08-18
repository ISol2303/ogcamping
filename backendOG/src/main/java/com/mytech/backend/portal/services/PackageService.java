package com.mytech.backend.portal.services;

import com.mytech.backend.portal.dto.PackageDTO;

import java.util.List;

public interface PackageService {
    PackageDTO createPackage(PackageDTO dto);
    PackageDTO getPackageById(Long id);
    List<PackageDTO> getAllPackages();
    List<PackageDTO> findAll();
    PackageDTO updatePackage(Long id, PackageDTO dto);
    void deletePackage(Long id);
}
