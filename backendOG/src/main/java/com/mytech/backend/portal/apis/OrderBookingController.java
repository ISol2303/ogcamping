package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.OrderBookingRequestDTO;
import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.OrderBookingRepository;
import com.mytech.backend.portal.services.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/apis/orders")
public class OrderBookingController {

    private final OrderBookingRepository orderBookingRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    public OrderBookingController(OrderBookingRepository orderBookingRepository,
                                  EmailService emailService) {
        this.orderBookingRepository = orderBookingRepository;
        this.emailService = emailService;
    }

    // =====================
    // 🔹 Helper generate mã
    // =====================
    private String generateOrderCode() {
        String timestamp = Long.toString(System.currentTimeMillis(), 36).toUpperCase();
        String randomStr = Integer.toString(random.nextInt(36 * 36 * 36 * 36), 36).toUpperCase();
        return "#OGC" + timestamp + randomStr;
    }

    private String generateUniqueOrderCode() {
        String code;
        do {
            code = generateOrderCode();
        } while (orderBookingRepository.existsByOrderCode(code));
        return code;
    }

    // =====================
    // 🔹 Helper gửi mail xác nhận
    // =====================
    private void sendConfirmationEmail(OrderBooking order) {
        try {
            String subject = "Xác nhận đặt chỗ - OGCAMPING";
            String body = "Xin chào " + order.getCustomerName() + ",\n\n"
                    + "Đơn hàng của bạn đã được xác nhận bởi nhân viên OGCAMPING.\n"
                    + "Mã đơn hàng: " + order.getOrderCode() + "\n"
                    + "Ngày check-in: " + order.getBookingDate() + "\n"
                    + "Tổng tiền: " + order.getTotalPrice() + " VND\n\n"
                    + "Cảm ơn bạn đã tin tưởng OGCAMPING!";
            emailService.sendOrderConfirmation(order.getEmail(), subject, body);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // =====================
    // 🔹 API GET ALL ORDERS (staff)
    // =====================
    @GetMapping("/all")
    @PreAuthorize("hasRole('STAFF')")
    public List<OrderBooking> getAllOrders() {
        return orderBookingRepository.findAll();
    }

    // =====================
    // 🔹 API GET MY ORDERS (user login)
    // =====================
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderBooking>> getMyOrders(Authentication authentication) {
        String email = authentication.getName();
        List<OrderBooking> myOrders = orderBookingRepository.findByEmail(email);
        return ResponseEntity.ok(myOrders);
    }

    // =====================
    // 🔹 API GET ORDERS BY CUSTOMER EMAIL (staff)
    // =====================
    @GetMapping("/by-customer")
    @PreAuthorize("hasRole('STAFF')")
    public List<OrderBooking> getOrdersByCustomer(@RequestParam String email) {
        return orderBookingRepository.findByEmail(email);
    }

    // =====================
    // 🔹 API CREATE ORDER
    // =====================
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderBookingRequestDTO dto,
                                         @AuthenticationPrincipal User user) {
        OrderBooking order = new OrderBooking();

        if (dto.getOrderCode() == null || orderBookingRepository.existsByOrderCode(dto.getOrderCode())) {
            order.setOrderCode(generateUniqueOrderCode());
        } else {
            order.setOrderCode(dto.getOrderCode());
        }

        order.setBookingDate(dto.getBookingDate());
        order.setOrderDate(dto.getOrderDate() != null ? dto.getOrderDate() : LocalDateTime.now());
        order.setPeople(dto.getPeople() != null ? dto.getPeople() : 1);
        order.setPhone(dto.getPhone());
        order.setPriority(dto.getPriority() != null ? dto.getPriority() : "NORMAL");
        order.setSpecialRequests(dto.getSpecialRequests());
        order.setEmergencyContact(dto.getEmergencyContact());
        order.setEmergencyPhone(dto.getEmergencyPhone());
        order.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        order.setTotalPrice(dto.getTotalPrice() != null ? dto.getTotalPrice() : 0.0);
        order.setCustomerName(dto.getCustomerName());

        if (user != null) {
            order.setUser(user);
            order.setEmail(user.getEmail());
        } else {
            if (dto.getEmail() == null || dto.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body("Email is required for guest booking.");
            }
            order.setEmail(dto.getEmail());
        }

        OrderBooking savedOrder = orderBookingRepository.save(order);
        return ResponseEntity.ok(savedOrder);
    }

    // =====================
    // 🔹 API CONFIRM SINGLE ORDER (staff)
    // =====================
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> confirmOrder(@PathVariable("id") Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "ID đơn hàng không được null"));
        }

        try {
            // Lấy đơn hàng theo id
            OrderBooking order = orderBookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + id));

            // Kiểm tra trạng thái đã CONFIRMED chưa
            if ("CONFIRMED".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "Đơn hàng đã được xác nhận trước đó"));
            }

            // Xác nhận đơn hàng
            order.setStatus("CONFIRMED");
            order.setConfirmedAt(LocalDateTime.now());
            orderBookingRepository.save(order);

            // Gửi email xác nhận
            try {
                sendConfirmationEmail(order);
            } catch (Exception e) {
                // Không crash nếu gửi mail fail
                e.printStackTrace();
            }

            return ResponseEntity.ok(order);

        } catch (RuntimeException e) {
            // Lỗi do không tìm thấy đơn hàng
            e.printStackTrace();
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            // Các lỗi khác
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("error", "Có lỗi xảy ra khi xác nhận đơn"));
        }
    }


    // =====================
    // 🔹 API CONFIRM ALL PENDING ORDERS (staff)
    // =====================
    @PatchMapping("/confirm-all")
    @PreAuthorize("hasRole('STAFF')")
    @Transactional
    public ResponseEntity<?> confirmAllOrders() {
        try {
            int updatedCount = orderBookingRepository.updateStatusForPendingOrders(
                    "CONFIRMED",
                    LocalDateTime.now()
            );
            return ResponseEntity.ok(Collections.singletonMap(
                    "message", "Đã xác nhận " + updatedCount + " đơn hàng PENDING"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    // ====== API gửi single email ======
    @PatchMapping("/{id}/send-email")
    @PreAuthorize("hasRole('STAFF')")
    @Transactional
    public String sendEmailSingle(@PathVariable("id") Long id) {
        OrderBooking order = orderBookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getEmailSentAt() != null) {
            return "Đơn đã gửi email trước đó, bỏ qua.";
        }

        try {
            emailService.sendBookingEmail(order);
            order.setEmailSentAt(LocalDateTime.now());
            orderBookingRepository.save(order);
            return "Đã gửi email đơn " + order.getOrderCode();
        } catch (Exception e) {
            return "Lỗi gửi email: " + e.getMessage();
        }
    }

    // ====== API gửi email tất cả các đơn chưa gửi ======
    @PatchMapping("/send-email-all")
    @Transactional
    public String sendEmailAllPending() {
        List<OrderBooking> pendingEmailOrders = orderBookingRepository.findByEmailSentAtIsNull();

        if (pendingEmailOrders.isEmpty()) {
            return "Không có đơn hàng nào cần gửi email.";
        }

        int success = 0;
        int fail = 0;

        for (OrderBooking order : pendingEmailOrders) {
            try {
                emailService.sendBookingEmail(order);
                order.setEmailSentAt(LocalDateTime.now());
                orderBookingRepository.save(order);
                success++;
            } catch (Exception e) {
                fail++;
                // log lỗi, giữ nguyên emailSentAt = null để thử lại sau
            }
        }

        return "Gửi email xong: thành công=" + success + ", lỗi=" + fail;
    }


}
