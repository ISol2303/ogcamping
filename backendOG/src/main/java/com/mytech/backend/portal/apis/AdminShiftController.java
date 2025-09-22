package com.mytech.backend.portal.apis;



import com.mytech.backend.portal.dto.Shift.AssignStaffRequest;
import com.mytech.backend.portal.dto.Shift.ShiftRequestDTO;
import com.mytech.backend.portal.dto.Shift.ShiftResponseDTO;
import com.mytech.backend.portal.models.Shift.AssignmentRole;
import com.mytech.backend.portal.models.Shift.Shift;
import com.mytech.backend.portal.models.Shift.ShiftAssignment;
import com.mytech.backend.portal.models.Shift.ShiftStatus;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.ShiftAssignmentRepository;
import com.mytech.backend.portal.repositories.ShiftRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import com.mytech.backend.portal.services.Shift.ShiftService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/apis/v1/admin/shifts")
@RequiredArgsConstructor
public class AdminShiftController {

    private final ShiftRepository shiftRepository;
    private final ShiftAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final ShiftService shiftService;

    @GetMapping
    public ResponseEntity<List<ShiftResponseDTO>> getAllShifts() {
        return ResponseEntity.ok(shiftService.getAllShifts());
    }
    // Tạo ca trực (admin)
    @PostMapping
    @Transactional
    public ResponseEntity<ShiftResponseDTO> createShift(@RequestBody ShiftRequestDTO req) {
        Shift shift = Shift.builder()
                .shiftDate(req.getShiftDate())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .status(ShiftStatus.REGISTERED)
                .build();
        shift = shiftRepository.save(shift);
        return ResponseEntity.ok(toDTO(shift));
    }

    // Sửa ca trực
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ShiftResponseDTO> updateShift(@PathVariable Long id, @RequestBody ShiftRequestDTO req) {
        Shift shift = shiftRepository.findById(id).orElseThrow(() -> new RuntimeException("Shift not found"));
        shift.setShiftDate(req.getShiftDate());
        shift.setStartTime(req.getStartTime());
        shift.setEndTime(req.getEndTime());
        shift = shiftRepository.save(shift);
        return ResponseEntity.ok(toDTO(shift));
    }

    // Xóa ca trực (cascade will remove assignments)
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteShift(@PathVariable Long id) {
        Shift shift = shiftRepository.findById(id).orElseThrow(() -> new RuntimeException("Shift not found"));
        shiftRepository.delete(shift);
        return ResponseEntity.noContent().build();
    }

    // Thêm nhân viên vào ca trực (admin)
    @PostMapping("/{shiftId}/staff")
    @Transactional
    public ResponseEntity<ShiftResponseDTO> addStaffToShift(@PathVariable Long shiftId, @RequestBody AssignStaffRequest req) {
        Shift shift = shiftRepository.findById(shiftId).orElseThrow(() -> new RuntimeException("Shift not found"));
        User staff = userRepository.findById(req.getStaffId()).orElseThrow(() -> new RuntimeException("Staff not found"));

        // tránh duplicate
        assignmentRepository.findByShiftIdAndUserId(shiftId, staff.getId())
                .ifPresent(a -> { throw new RuntimeException("Staff already in shift"); });

        ShiftAssignment asg = ShiftAssignment.builder()
                .shift(shift)
                .user(staff)
                .role(req.getRole() != null ? AssignmentRole.valueOf(req.getRole()) : AssignmentRole.STAFF)
                .build();
        assignmentRepository.save(asg);
        shift.getAssignments().add(asg);
        shiftRepository.save(shift);

        return ResponseEntity.ok(toDTO(shift));
    }

    // Xóa nhân viên khỏi ca trực
    @DeleteMapping("/{shiftId}/staff/{staffId}")
    @Transactional
    public ResponseEntity<Void> removeStaffFromShift(@PathVariable Long shiftId, @PathVariable Long staffId) {
        assignmentRepository.findByShiftIdAndUserId(shiftId, staffId)
                .ifPresent(assignmentRepository::delete);
        return ResponseEntity.noContent().build();
    }

    // Xem danh sách nhân viên trong ca trực
    @GetMapping("/{shiftId}/staff")
    public ResponseEntity<?> listStaffInShift(@PathVariable Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId).orElseThrow(() -> new RuntimeException("Shift not found"));
        var list = shift.getAssignments().stream()
                .map(a -> new ShiftResponseDTO.AssignmentDTO(a.getUser().getId(), a.getUser().getName(), a.getRole().name()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // mapping
    private ShiftResponseDTO toDTO(Shift shift) {
        ShiftResponseDTO dto = new ShiftResponseDTO();
        dto.setId(shift.getId());
        dto.setShiftDate(shift.getShiftDate());
        dto.setStartTime(shift.getStartTime());
        dto.setEndTime(shift.getEndTime());
        dto.setStatus(shift.getStatus());
        dto.setAssignments(shift.getAssignments().stream()
                .map(a -> new ShiftResponseDTO.AssignmentDTO(a.getUser().getId(), a.getUser().getName(), a.getRole().name()))
                .collect(Collectors.toList())
        );
        return dto;
    }
}
