package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Shift.RegisterShiftRequest;
import com.mytech.backend.portal.dto.Shift.ShiftResponseDTO;
import com.mytech.backend.portal.dto.StaffDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Shift.AssignmentRole;
import com.mytech.backend.portal.models.Shift.Shift;
import com.mytech.backend.portal.models.Shift.ShiftAssignment;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.ShiftAssignmentRepository;
import com.mytech.backend.portal.repositories.ShiftRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/apis/staffs")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffController {

    // Fake DB (thay bằng service khi bạn có DB thật)
    private final Map<Long, StaffDTO> staffMap = new HashMap<>();
    private final ShiftRepository shiftRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private long idCounter = 1;

    public StaffController(ShiftRepository shiftRepository, ShiftAssignmentRepository shiftAssignmentRepository, UserRepository userRepository, BookingRepository bookingRepository) {
        this.shiftRepository = shiftRepository;
        this.shiftAssignmentRepository = shiftAssignmentRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

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
    // Nhân viên đăng ký ca trực (nếu staff tự đăng ký)
    @PostMapping("/shifts/{shiftId}/register")
    @Transactional
    public ResponseEntity<?> registerToShift(@PathVariable Long shiftId, @RequestBody(required = false) RegisterShiftRequest req) {
        Long staffId = req != null && req.getStaffId() != null ? req.getStaffId() : getCurrentUserId();
        User staff = userRepository.findById(staffId).orElseThrow(() -> new RuntimeException("Staff not found"));
        Shift shift = shiftRepository.findById(shiftId).orElseThrow(() -> new RuntimeException("Shift not found"));

        // Kiểm tra đã đăng ký chưa
        if (shiftAssignmentRepository.findByShiftIdAndUserId(shiftId, staffId).isPresent()) {
            throw new RuntimeException("Already registered");
        }

        // Nếu cần limit số người, kiểm tra assignmentRepository.countByShiftId(shiftId)
        // thêm logic limit nếu cần

        ShiftAssignment asg = ShiftAssignment.builder()
                .shift(shift)
                .user(staff)
                .role(AssignmentRole.STAFF)
                .build();
        shiftAssignmentRepository.save(asg);
        return ResponseEntity.ok("Registered");
    }

    // Xem ca trực của mình
    @GetMapping("/me/shifts")
    public ResponseEntity<?> myShifts(@RequestParam(required = false) Long staffId) {
        Long id = staffId != null ? staffId : getCurrentUserId();
        List<ShiftAssignment> assignments = shiftAssignmentRepository.findByUserId(id);
        var dto = assignments.stream()
                .map(a -> {
                    Shift s = a.getShift();
                    return new ShiftResponseDTO.AssignmentDTO(
                            a.getUser().getId(), a.getUser().getName(), a.getRole().name()
                    );
                }).collect(Collectors.toList());
        return ResponseEntity.ok(assignments.stream()
                .map(a -> {
                    Shift s = a.getShift();
                   ShiftResponseDTO r = new ShiftResponseDTO();
                    r.setId(s.getId());
                    r.setShiftDate(s.getShiftDate());
                    r.setStartTime(s.getStartTime());
                    r.setEndTime(s.getEndTime());
                    r.setStatus(s.getStatus());
                    r.setAssignments(s.getAssignments().stream()
                            .map(x -> new ShiftResponseDTO.AssignmentDTO(x.getUser().getId(), x.getUser().getName(), x.getRole().name()))
                            .collect(Collectors.toList()));
                    return r;
                }).collect(Collectors.toList()));
    }

    // Xem booking được phân công cho mình
    @GetMapping("/me/bookings")
    public ResponseEntity<?> myBookings(@RequestParam(required = false) Long staffId) {
        Long id = staffId != null ? staffId : getCurrentUserId();
        User staff = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Staff not found"));
        List<Booking> bookings = bookingRepository.findByAssignedStaff(staff);
        return ResponseEntity.ok(bookings);
    }

    // Nhân viên nhận booking (xác nhận)
    @PutMapping("/bookings/{bookingId}/accept")
    @Transactional
    public ResponseEntity<?> acceptBooking(@PathVariable Long bookingId, @RequestParam(required = false) Long staffId) {
        Long id = staffId != null ? staffId : getCurrentUserId();
        User staff = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Staff not found"));

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getAssignedStaff() == null || !booking.getAssignedStaff().getId().equals(staff.getId())) {
            throw new RuntimeException("Not assigned to you");
        }

        booking.setStatus(BookingStatus.IN_PROGRESS); // hoặc ACCEPTED_BY_STAFF
        bookingRepository.save(booking);
        return ResponseEntity.ok("Accepted");
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("No authenticated user");
        }
        Object principal = auth.getPrincipal();
        // Nếu bạn dùng UserDetails with id, cast và lấy id; else yêu cầu truyền staffId trong request
        // Giả sử principal là our custom UserDetails with getId()
        try {
            Class<?> cls = principal.getClass();
            var m = cls.getMethod("getId");
            return (Long) m.invoke(principal);
        } catch (Exception e) {
            throw new RuntimeException("Cannot resolve current user id from security principal. Please pass staffId in request.");
        }
    }
}