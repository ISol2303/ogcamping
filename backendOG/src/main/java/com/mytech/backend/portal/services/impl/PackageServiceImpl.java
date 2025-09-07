package com.mytech.backend.portal.services.impl;

import com.mytech.backend.portal.dto.PackageDTO;
import com.mytech.backend.portal.models.Package;
import com.mytech.backend.portal.repositories.PackageRepository;
import com.mytech.backend.portal.services.PackageService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageServiceImpl implements PackageService {
	@Autowired
    private PackageRepository packageRepository;
	@Autowired
    private ModelMapper modelMapper;

    @Override
    public PackageDTO createPackage(PackageDTO dto) {
        Package entity = modelMapper.map(dto, Package.class);
        return modelMapper.map(packageRepository.save(entity), PackageDTO.class);
    }

    @Override
    public PackageDTO getPackageById(Long id) {
        return packageRepository.findById(id)
                .map(entity -> modelMapper.map(entity, PackageDTO.class))
                .orElse(null);
    }

    @Override
    public List<PackageDTO> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(entity -> modelMapper.map(entity, PackageDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public PackageDTO updatePackage(Long id, PackageDTO dto) {
        Package entity = modelMapper.map(dto, Package.class);
        entity.setId(id);
        return modelMapper.map(packageRepository.save(entity), PackageDTO.class);
    }

    @Override
    public void deletePackage(Long id) {
        packageRepository.deleteById(id);
    }

    @Override
    public List<PackageDTO> findAll() {
        return packageRepository.findAll()
                .stream()
                .map(pkg -> modelMapper.map(pkg, PackageDTO.class))
                .collect(Collectors.toList());
    }

}
