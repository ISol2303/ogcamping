// src/main/java/com/mytech/backend/portal/apis/AdminController.java
package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.*;
import com.mytech.backend.portal.services.*;
import com.mytech.backend.portal.services.Booking.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/apis/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;
    @Autowired
    private AdminService adminService;
    @Autowired
    private BookingService bookingService;
    @Autowired
    private GearService gearService;
    @Autowired
    private PackageService packageService;

    @GetMapping("/user/{id}")
    public ResponseEntity<UserDTO> fetchUser(@PathVariable Long id) {
        UserDTO user = userService.findById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<List<StatDTO>> fetchStats(@RequestParam String period) {
        return ResponseEntity.ok(adminService.getStats(period));
    }

//    @GetMapping("/bookings")
//    public ResponseEntity<List<BookingDTO>> fetchBookings() {
//        return ResponseEntity.ok(bookingService.getBookings());
//    }

    @GetMapping("/staff")
    public ResponseEntity<List<UserDTO>> fetchStaff() {
        List<UserDTO> staff = userService.getAllUsers().stream()
                .filter(u -> "STAFF".equals(u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(staff);
    }

    @PostMapping("/staff")
    public ResponseEntity<UserDTO> createStaff(@RequestBody CreateStaffRequest request) {
        UserDTO dto = new UserDTO();
        dto.setName(request.getName());
        dto.setEmail(request.getEmail());
        dto.setPhone(request.getPhone());
        dto.setPassword(request.getPassword()); // encode trong service
        dto.setRole("STAFF");
        dto.setDepartment(request.getDepartment());
        dto.setJoinDate(request.getJoinDate());
        dto.setStatus(request.getStatus().name()); // nếu request.getStatus() là enum
        return ResponseEntity.ok(userService.createUser(dto));
    }

    @GetMapping("/services")
    public ResponseEntity<List<PackageDTO>> fetchServices() {
        return ResponseEntity.ok(packageService.findAll());
    }

    @GetMapping("/gears")
    public ResponseEntity<List<GearDTO>> fetchEquipment() {
        return ResponseEntity.ok(gearService.findAll());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserDTO>> fetchCustomers() {
        List<UserDTO> customers = userService.getAllUsers().stream()
                .filter(u -> "CUSTOMER".equals(u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(customers);
    }
}
