package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.PackageDTO;

public interface PackageService {
    PackageDTO createPackage(PackageDTO dto);
    PackageDTO getPackageById(Long id);
    List<PackageDTO> getAllPackages();
    PackageDTO updatePackage(Long id, PackageDTO dto);
    void deletePackage(Long id);
}
