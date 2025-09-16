package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.StaffDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/apis/staffs")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffController {

    // Fake DB (thay bằng service khi bạn có DB thật)
    private final Map<Long, StaffDTO> staffMap = new HashMap<>();
    private long idCounter = 1;

    @GetMapping
    public ResponseEntity<List<StaffDTO>> getAllStaffs() {
        return ResponseEntity.ok(new ArrayList<>(staffMap.values()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffDTO> getStaffById(@PathVariable Long id) {
        StaffDTO staff = staffMap.get(id);
        return staff != null ? ResponseEntity.ok(staff) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<StaffDTO> createStaff(@RequestBody StaffDTO staffDTO) {
        staffDTO.setId(idCounter++);
        staffMap.put(staffDTO.getId(), staffDTO);
        return ResponseEntity.ok(staffDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffDTO> updateStaff(@PathVariable Long id, @RequestBody StaffDTO updatedStaff) {
        if (!staffMap.containsKey(id)) {
            return ResponseEntity.notFound().build();
        }
        updatedStaff.setId(id);
        staffMap.put(id, updatedStaff);
        return ResponseEntity.ok(updatedStaff);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        if (staffMap.remove(id) != null) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}