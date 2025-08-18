package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.PackageDTO;
import com.mytech.backend.portal.services.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/apis/v1/packages", "/apis/test/packages"})
@RequiredArgsConstructor
public class PackageController {
	@Autowired
    private PackageService packageService;

    @PostMapping
    public ResponseEntity<PackageDTO> create(@RequestBody PackageDTO dto) {
        return ResponseEntity.ok(packageService.createPackage(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackageDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    @GetMapping
    public ResponseEntity<List<PackageDTO>> getAll() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PackageDTO> update(@PathVariable Long id, @RequestBody PackageDTO dto) {
        return ResponseEntity.ok(packageService.updatePackage(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
