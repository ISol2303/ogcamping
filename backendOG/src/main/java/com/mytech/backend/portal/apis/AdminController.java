
package com.mytech.backend.portal.apis;

import java.util.List;
import java.util.stream.Collectors;

import com.mytech.backend.portal.security.AppUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.dto.AreaDTO;
import com.mytech.backend.portal.dto.CategoryDTO;
import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.dto.InventoryDTO;
import com.mytech.backend.portal.dto.LocationDTO;
import com.mytech.backend.portal.dto.PackageDTO;
import com.mytech.backend.portal.dto.PromotionDTO;
import com.mytech.backend.portal.dto.StatDTO;
import com.mytech.backend.portal.dto.UserDTO;
import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.services.AdminService;
import com.mytech.backend.portal.services.AreaService;
import com.mytech.backend.portal.services.CategoryService;
import com.mytech.backend.portal.services.GearService;
import com.mytech.backend.portal.services.LocationService;
import com.mytech.backend.portal.services.PackageService;
import com.mytech.backend.portal.services.PromotionService;
import com.mytech.backend.portal.services.UserService;
import com.mytech.backend.portal.services.Booking.BookingService;

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
    @Autowired
    private LocationService locationService;
    @Autowired
    private PromotionService promotionService;
    @Autowired
    private CategoryService categoryService; // New service for categories
    @Autowired
    private AreaService areaService; // New service for areas

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> fetchUser(@PathVariable Long id) {
        UserDTO user = userService.findById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<List<StatDTO>> fetchStats(@RequestParam String period) {
        return ResponseEntity.ok(adminService.getStats(period));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponseDTO> fetchBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }

    @PostMapping("/bookings/{id}/checkin")
    public ResponseEntity<BookingResponseDTO> checkInBooking(@PathVariable Long id) {
        BookingResponseDTO updatedBooking = bookingService.checkInBooking(id);
        return updatedBooking != null ? ResponseEntity.ok(updatedBooking) : ResponseEntity.notFound().build();
    }

    @PostMapping("/bookings/{id}/checkout")
    public ResponseEntity<BookingResponseDTO> checkOutBooking(@PathVariable Long id) {
        BookingResponseDTO updatedBooking = bookingService.checkOutBooking(id);
        return updatedBooking != null ? ResponseEntity.ok(updatedBooking) : ResponseEntity.notFound().build();
    }

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
        dto.setStatus(request.getStatus());
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

    @GetMapping("/inventory")
    public ResponseEntity<List<InventoryDTO>> fetchInventory() {
        return ResponseEntity.ok(gearService.findInventory());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserDTO>> fetchCustomers() {
        List<UserDTO> customers = userService.getAllUsers().stream()
                .filter(u -> "CUSTOMER".equals(u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/locations")
    public ResponseEntity<List<LocationDTO>> fetchLocations() {
        return ResponseEntity.ok(locationService.findAll());
    }

    @GetMapping("/promotions")
    public ResponseEntity<List<PromotionDTO>> fetchPromotions() {
        return ResponseEntity.ok(promotionService.findAll());
    }

    @PostMapping("/promotions")
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody CreatePromotionRequest request) {
        PromotionDTO dto = new PromotionDTO();
        dto.setCode(request.getCode());
        dto.setDiscount(request.getDiscount());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setStatus(request.getStatus());
        return ResponseEntity.ok(promotionService.createPromotion(dto));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> fetchCategories() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @GetMapping("/areas")
    public ResponseEntity<List<AreaDTO>> fetchAreas() {
        return ResponseEntity.ok(areaService.findAll());
    }
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentAdmin(@AuthenticationPrincipal AppUserDetails userDetails) {
        return ResponseEntity.ok(userService.findByEmail(userDetails.getUsername()));
    }
}