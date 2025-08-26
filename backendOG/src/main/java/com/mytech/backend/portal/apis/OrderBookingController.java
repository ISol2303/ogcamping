package com.mytech.backend.portal.apis;

import java.util.List;

import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.dto.OrderBookingRequestDTO;
import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.OrderBookingRepository;

@RestController
@RequestMapping("/apis/orders")
public class OrderBookingController {

    private final OrderBookingRepository orderBookingRepository;

    public OrderBookingController(OrderBookingRepository orderBookingRepository) {
        this.orderBookingRepository = orderBookingRepository;
    }

    // Lấy tất cả đơn hàng (staff)
    @GetMapping("/all")
    @PreAuthorize("hasRole('STAFF')")
    public List<OrderBooking> getAllOrders() {
        return orderBookingRepository.findAll();
    }
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderBooking>> getMyOrders(Authentication authentication) {
        String email = authentication.getName(); // lấy email từ token
        List<OrderBooking> myOrders = orderBookingRepository.findByEmail(email);
        return ResponseEntity.ok(myOrders);
    }



    // Lấy đơn hàng theo email khách (staff)
    @GetMapping("/by-customer")
    @PreAuthorize("hasRole('STAFF')")
    public List<OrderBooking> getOrdersByCustomer(@RequestParam String email) {
        return orderBookingRepository.findByEmail(email);
    }

    // Tạo đơn hàng mới (có thể guest hoặc user)
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderBookingRequestDTO dto,
            @AuthenticationPrincipal User user
    ) {
        OrderBooking order = new OrderBooking();

        order.setBookingDate(dto.getBookingDate());
        order.setOrderDate(dto.getOrderDate());
        order.setPeople(dto.getPeople() != null ? dto.getPeople() : 1);
        order.setPhone(dto.getPhone());
        order.setPriority(dto.getPriority());
        order.setSpecialRequests(dto.getSpecialRequests());
        order.setEmergencyContact(dto.getEmergencyContact());
        order.setEmergencyPhone(dto.getEmergencyPhone());
        order.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        order.setTotalPrice(dto.getTotalPrice() != null ? dto.getTotalPrice() : 0.0);
        order.setCustomerName(dto.getCustomerName());

        // Nếu user login thì lấy email từ user
        if (user != null) {
            order.setUser(user);
            order.setEmail(user.getEmail());
        } else {
            // Guest thì email phải nhập từ form
            if (dto.getEmail() == null || dto.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body("Email is required for guest booking.");
            }
            order.setEmail(dto.getEmail());
        }

        OrderBooking savedOrder = orderBookingRepository.save(order);
        return ResponseEntity.ok(savedOrder);
    }


}
