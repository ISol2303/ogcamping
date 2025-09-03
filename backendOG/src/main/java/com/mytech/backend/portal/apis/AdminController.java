package com.mytech.backend.portal.apis;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mytech.backend.portal.dto.AreaDTO;
import com.mytech.backend.portal.dto.BookingResponseDTO;
import com.mytech.backend.portal.dto.CategoryDTO;
import com.mytech.backend.portal.dto.CreateGearRequest;
import com.mytech.backend.portal.dto.GearDTO;
import com.mytech.backend.portal.dto.LocationDTO;
import com.mytech.backend.portal.dto.PromotionDTO;
import com.mytech.backend.portal.dto.ServiceRequestDTO;
import com.mytech.backend.portal.dto.ServiceResponseDTO;
import com.mytech.backend.portal.dto.StatDTO;
import com.mytech.backend.portal.dto.UserDTO;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.services.AdminService;
import com.mytech.backend.portal.services.AreaService;
import com.mytech.backend.portal.services.BookingService;
import com.mytech.backend.portal.services.CategoryService;
import com.mytech.backend.portal.services.GearService;
import com.mytech.backend.portal.services.LocationService;
import com.mytech.backend.portal.services.PromotionService;
import com.mytech.backend.portal.services.ServiceService;
import com.mytech.backend.portal.services.UserService;

@RestController
@RequestMapping("/apis/v1/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserService userService;
    @Autowired
    private AdminService adminService;
    @Autowired
    private BookingService bookingService;
    @Autowired
    private GearService gearService;
    @Autowired
    private ServiceService serviceService;
    @Autowired
    private LocationService locationService;
    @Autowired
    private PromotionService promotionService;
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private AreaService areaService;

    @GetMapping("/users/{email}")
    public ResponseEntity<UserDTO> fetchUser(@PathVariable("email") String email) {
        logger.info("Fetching user with email: {}", email);
        try {
            UserDTO user = userService.getUserByEmail(email);
            if (user == null) {
                logger.warn("User not found for email: {}", email);
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error fetching user with email {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch user: " + e.getMessage(), e);
        }
    }


    @GetMapping("/stats")
    public ResponseEntity<List<StatDTO>> getStats(@RequestParam("period") String period) {
        try {
            List<StatDTO> stats = adminService.getStats(period);
            return ResponseEntity.ok(stats);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponseDTO>> fetchAllBookings() {
        logger.info("Fetching all bookings");
        try {
            List<BookingResponseDTO> bookings = bookingService.getAllBookings();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error fetching bookings: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch bookings: " + e.getMessage(), e);
        }
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponseDTO> fetchBooking(@PathVariable Long id) {
        logger.info("Fetching booking with ID: {}", id);
        try {
            BookingResponseDTO booking = bookingService.getBooking(id);
            if (booking == null) {
                logger.warn("Booking not found for ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            logger.error("Error fetching booking with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch booking: " + e.getMessage(), e);
        }
    }

    @PostMapping("/bookings/{id}/checkin")
    public ResponseEntity<BookingResponseDTO> checkInBooking(@PathVariable Long id) {
        logger.info("Checking in booking with ID: {}", id);
        try {
            BookingResponseDTO updatedBooking = bookingService.checkInBooking(id);
            if (updatedBooking == null) {
                logger.warn("Booking not found for check-in with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            logger.error("Error checking in booking with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to check in booking: " + e.getMessage(), e);
        }
    }

    @PostMapping("/bookings/{id}/checkout")
    public ResponseEntity<BookingResponseDTO> checkOutBooking(@PathVariable Long id) {
        logger.info("Checking out booking with ID: {}", id);
        try {
            BookingResponseDTO updatedBooking = bookingService.checkOutBooking(id);
            if (updatedBooking == null) {
                logger.warn("Booking not found for check-out with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            logger.error("Error checking out booking with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to check out booking: " + e.getMessage(), e);
        }
    }

    @GetMapping("/staff")
    public ResponseEntity<List<UserDTO>> fetchStaff() {
        logger.info("Fetching staff");
        try {
            List<UserDTO> staff = userService.getAllUsers().stream()
                    .filter(u -> User.Role.STAFF.equals(u.getRole()))
                    .map(u -> {
                        UserDTO dto = new UserDTO();
                        dto.setId(u.getId());
                        dto.setName(u.getName());
                        dto.setEmail(u.getEmail());
                        dto.setPhone(u.getPhone());
                        dto.setRole(User.Role.valueOf("STAFF"));
                        dto.setDepartment(u.getDepartment());
                        dto.setJoinDate(u.getJoinDate());
                        dto.setStatus(u.getStatus() != null ? u.getStatus().toLowerCase() : "active");
                        return dto;
                    })
                    .collect(Collectors.toList());
            logger.info("Fetched {} staff members", staff.size());
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            logger.error("Error fetching staff: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch staff: " + e.getMessage(), e);
        }
    }
    @PostMapping("/staff")
    public ResponseEntity<UserDTO> createStaff(@RequestBody CreateStaffRequest request) {
        logger.info("Creating staff with email: {}", request.getEmail());
        try {
            UserDTO dto = new UserDTO();
            dto.setName(request.getName());
            dto.setEmail(request.getEmail());
            dto.setPhone(request.getPhone());
            dto.setPassword(request.getPassword());
            dto.setRole(User.Role.valueOf("STAFF")); // Convert String to User.Role enum
            dto.setDepartment(request.getDepartment());
            dto.setJoinDate(request.getJoinDate());
            dto.setStatus(request.getStatus());
            UserDTO createdUser = userService.createUser(dto);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            logger.error("Error creating staff with email {}: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Failed to create staff: " + e.getMessage(), e);
        }
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceResponseDTO>> fetchServices() {
        logger.info("Fetching services");
        try {
            return ResponseEntity.ok(serviceService.getAllServices());
        } catch (Exception e) {
            logger.error("Error fetching services: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch services: " + e.getMessage(), e);
        }
    }

    @PostMapping(value = "/services", consumes = "multipart/form-data")
    public ResponseEntity<ServiceResponseDTO> createService(
            @RequestPart("service") ServiceRequestDTO request,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {
        logger.info("Creating service: {}", request.getName());
        try {
            ServiceResponseDTO createdService = serviceService.createService(request, imageFile);
            return ResponseEntity.ok(createdService);
        } catch (Exception e) {
            logger.error("Error creating service {}: {}", request.getName(), e.getMessage(), e);
            throw new RuntimeException("Failed to create service: " + e.getMessage(), e);
        }
    }

    @GetMapping("/gears")
    public ResponseEntity<List<GearDTO>> fetchEquipment() {
        logger.info("Fetching gears");
        try {
            return ResponseEntity.ok(gearService.getAllGears());
        } catch (Exception e) {
            logger.error("Error fetching gears: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch gears: " + e.getMessage(), e);
        }
    }

    @PostMapping(value = "/gears", consumes = "multipart/form-data")
    public ResponseEntity<GearDTO> createGear(
            @RequestPart("gear") CreateGearRequest request,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {
        logger.info("Creating gear: {}", request.getName());
        try {
            GearDTO dto = new GearDTO();
            dto.setName(request.getName());
            dto.setCategory(request.getCategory());
            dto.setArea(request.getArea());
            dto.setDescription(request.getDescription());
            dto.setQuantityInStock(request.getQuantityInStock());
            dto.setAvailable(request.getAvailable());
            dto.setPricePerDay(request.getPricePerDay());
            dto.setTotal(request.getTotal());
            dto.setStatus(request.getStatus());
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = saveImage(imageFile);
                dto.setImage(imageUrl);
            }
            return ResponseEntity.ok(gearService.createGear(dto));
        } catch (Exception e) {
            logger.error("Error creating gear {}: {}", request.getName(), e.getMessage(), e);
            throw new RuntimeException("Failed to create gear: " + e.getMessage(), e);
        }
    }

    private String saveImage(MultipartFile imageFile) throws IOException {
        logger.info("Saving image: {}", imageFile.getOriginalFilename());
        String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
        Path path = Paths.get("uploads/services", fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, imageFile.getBytes());
        return "/uploads/" + fileName;
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        logger.info("Deleting service with ID: {}", id);
        try {
            serviceService.deleteService(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting service with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete service: " + e.getMessage(), e);
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<GearDTO>> fetchInventory() {
        logger.info("Fetching inventory");
        try {
            return ResponseEntity.ok(gearService.getAllGears());
        } catch (Exception e) {
            logger.error("Error fetching inventory: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch inventory: " + e.getMessage(), e);
        }
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserDTO>> getAllCustomers() {
        logger.info("Fetching all customers");
        try {
            List<UserDTO> customers = userService.getAllUsers().stream()
                    .filter(userDTO -> userDTO.getRole() == User.Role.CUSTOMER)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            logger.error("Error fetching customers: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch customers: " + e.getMessage(), e);
        }
    }

    @GetMapping("/locations")
    public ResponseEntity<List<LocationDTO>> fetchLocations() {
        logger.info("Fetching locations");
        try {
            return ResponseEntity.ok(locationService.findAll());
        } catch (Exception e) {
            logger.error("Error fetching locations: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch locations: " + e.getMessage(), e);
        }
    }

    @GetMapping("/promotions")
    public ResponseEntity<List<PromotionDTO>> fetchPromotions() {
        logger.info("Fetching promotions");
        try {
            return ResponseEntity.ok(promotionService.findAll());
        } catch (Exception e) {
            logger.error("Error fetching promotions: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch promotions: " + e.getMessage(), e);
        }
    }

    @PostMapping("/promotions")
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody CreatePromotionRequest request) {
        logger.info("Creating promotion with code: {}", request.getCode());
        try {
            PromotionDTO dto = new PromotionDTO();
            dto.setCode(request.getCode());
            dto.setDiscount(request.getDiscount());
            dto.setStartDate(request.getStartDate());
            dto.setEndDate(request.getEndDate());
            dto.setStatus(request.getStatus());
            return ResponseEntity.ok(promotionService.createPromotion(dto));
        } catch (Exception e) {
            logger.error("Error creating promotion with code {}: {}", request.getCode(), e.getMessage(), e);
            throw new RuntimeException("Failed to create promotion: " + e.getMessage(), e);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> fetchCategories() {
        logger.info("Fetching categories");
        try {
            return ResponseEntity.ok(categoryService.findAll());
        } catch (Exception e) {
            logger.error("Error fetching categories: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch categories: " + e.getMessage(), e);
        }
    }

    @GetMapping("/areas")
    public ResponseEntity<List<AreaDTO>> fetchAreas() {
        logger.info("Fetching areas");
        try {
            return ResponseEntity.ok(areaService.findAll());
        } catch (Exception e) {
            logger.error("Error fetching areas: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch areas: " + e.getMessage(), e);
        }
    }
}