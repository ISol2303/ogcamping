package com.mytech.backend.portal.apis;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.StreamSupport;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.mytech.backend.portal.dto.AddDishRequestDTO;
import com.mytech.backend.portal.dto.OrderBookingRequestDTO;
import com.mytech.backend.portal.models.Dish;
import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.models.OrderItem;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.DishRepository;
import com.mytech.backend.portal.repositories.OrderBookingRepository;
import com.mytech.backend.portal.repositories.OrderItemRepository;
import com.mytech.backend.portal.services.EmailService;

@RestController
@RequestMapping("/apis/orders")
public class OrderBookingController {

	private final OrderBookingRepository orderBookingRepository;
	private final SimpMessagingTemplate messagingTemplate;
    private final OrderItemRepository orderItemRepository;
    private final DishRepository dishRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();


    public OrderBookingController(OrderBookingRepository orderBookingRepository,
            OrderItemRepository orderItemRepository,
            SimpMessagingTemplate messagingTemplate,
            DishRepository dishRepository,
            EmailService emailService) {
    	this.orderBookingRepository = orderBookingRepository;
    	this.orderItemRepository = orderItemRepository;
    	this.messagingTemplate = messagingTemplate;
    	this.dishRepository = dishRepository;
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
//    @PatchMapping("/{id}/confirm")
//    @PreAuthorize("hasRole('STAFF')")
//    public ResponseEntity<?> confirmOrder(@PathVariable("id") Long id) {
//        if (id == null) {
//            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "ID đơn hàng không được null"));
//        }
//
//        try {
//            // Lấy đơn hàng theo id
//            OrderBooking order = orderBookingRepository.findById(id)
//                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + id));
//
//            // Kiểm tra trạng thái đã CONFIRMED chưa
//            if ("CONFIRMED".equalsIgnoreCase(order.getStatus())) {
//                return ResponseEntity.badRequest()
//                        .body(Collections.singletonMap("error", "Đơn hàng đã được xác nhận trước đó"));
//            }
//
//            // Xác nhận đơn hàng
//            order.setStatus("CONFIRMED");
//            order.setConfirmedAt(LocalDateTime.now());
//            orderBookingRepository.save(order);
//
//            // Gửi email xác nhận
//            try {
//                sendConfirmationEmail(order);
//            } catch (Exception e) {
//                // Không crash nếu gửi mail fail
//                e.printStackTrace();
//            }
//
//            return ResponseEntity.ok(order);
//
//        } catch (RuntimeException e) {
//            // Lỗi do không tìm thấy đơn hàng
//            e.printStackTrace();
//            return ResponseEntity.status(404)
//                    .body(Collections.singletonMap("error", e.getMessage()));
//        } catch (Exception e) {
//            // Các lỗi khác
//            e.printStackTrace();
//            return ResponseEntity.status(500)
//                    .body(Collections.singletonMap("error", "Có lỗi xảy ra khi xác nhận đơn"));
//        }
//    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('STAFF')")
    @Transactional
    public ResponseEntity<?> confirmOrder(@PathVariable("id") Long id) {
        if (id == null) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "ID đơn hàng không được null"));
        }

        try {
            // Lấy đơn hàng theo id
            OrderBooking order = orderBookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + id));

            // Nếu đã xác nhận rồi thì trả về
            if ("CONFIRMED".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "Đơn hàng đã được xác nhận trước đó"));
            }

            // Nếu email đã gửi trước đó thì không gửi lại
            if (order.getEmailSentAt() != null) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "Đơn hàng này đã được gửi email trước đó"));
            }

            // 🔥 Chỉ gửi email trước, nếu thành công mới xác nhận
            try {
                emailService.sendBookingEmail(order);
                order.setEmailSentAt(LocalDateTime.now());

                // Nếu email gửi ok thì mới set CONFIRMED
                order.setStatus("CONFIRMED");
                order.setConfirmedAt(LocalDateTime.now());
                orderBookingRepository.save(order);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Đơn hàng đã được xác nhận thành công và email đã gửi.");
                response.put("orderId", order.getId());
                response.put("orderCode", order.getOrderCode());
                response.put("status", order.getStatus());
                response.put("confirmedAt", order.getConfirmedAt());

                return ResponseEntity.ok(response);

            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500)
                        .body(Collections.singletonMap("error", "Gửi email thất bại, đơn hàng chưa được xác nhận."));
            }

        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
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
    //add thông báo 
    @PostMapping("/add")
    public OrderBooking addOrder(@RequestBody OrderBooking order) {
        // Lưu order vào DB
        OrderBooking savedOrder = orderBookingRepository.save(order);

        // Gửi notification tới tất cả client subscribe topic /topic/orders
        messagingTemplate.convertAndSend("/topic/orders", savedOrder);

        System.out.println("✅ Đã thêm đơn mới và gửi notification: " + savedOrder.getCustomerName());

        return savedOrder;
    }

  

    @PostMapping("/{orderId}/add-dishes")
    public ResponseEntity<?> addDishesToOrder(
            @PathVariable("orderId") Long orderId,
            @RequestBody List<AddDishRequestDTO> dishesRequest) {
        try {
            OrderBooking order = orderBookingRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

            for (AddDishRequestDTO dto : dishesRequest) {
                Dish dish = dishRepository.findById(dto.getDishId())
                        .orElseThrow(() -> new RuntimeException("Món ăn không tồn tại"));

                // ✅ Kiểm tra số lượng tồn kho
                if (dish.getQuantity() < dto.getQuantity()) {
                    throw new RuntimeException("Không đủ số lượng cho món: " + dish.getName());
                }

                // ✅ Trừ số lượng trong DB
                dish.setQuantity(dish.getQuantity() - dto.getQuantity());
                dishRepository.save(dish);

                // Tạo OrderItem
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setDish(dish);
                item.setQuantity(dto.getQuantity());
                item.setUnitPrice(dish.getPrice());
                item.setTotalPrice(dish.getPrice() * dto.getQuantity());

                orderItemRepository.save(item);
            }

            // ✅ Gửi WebSocket cho staff
            Map<String, Object> message = new HashMap<>();
            message.put("orderId", order.getId());
            message.put("email", order.getEmail());
            message.put("message", "Có đơn hàng đặt thêm món từ " + order.getEmail());

            messagingTemplate.convertAndSend("/topic/order-updates", message);

            return ResponseEntity.ok("Thêm món thành công");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm món: " + e.getMessage());
        }
    }


    @GetMapping("/{orderId}/details")
    public ResponseEntity<?> getOrderDetails(@PathVariable("orderId") Long orderId) {
        Optional<OrderBooking> orderOpt = orderBookingRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }
        return ResponseEntity.ok(orderOpt.get());
    }



	
	    // =====================
	    // 🔹 API GET ORDER DETAILS (staff)
   
	    
//	    @GetMapping("/all-added-dishes")
//	    public ResponseEntity<?> getAllAddedDishes() {
//	        List<OrderBooking> orders = orderBookingRepository.findAll();
//	        List<Map<String, Object>> allOrdersResponse = new ArrayList<>();
//
//	        for (OrderBooking order : orders) {
//	            List<OrderItem> items = orderItemRepository.findByOrder(order);
//
//	            // Chỉ lấy món đã được khách thêm (quantity > 0)
//	            List<OrderItem> addedItems = items.stream()
//	                                             .filter(i -> i.getQuantity() > 0)
//	                                             .collect(Collectors.toList());
//
//	            if (addedItems.isEmpty()) continue; // bỏ qua đơn không có món
//
//	            List<Map<String, Object>> itemsResponse = new ArrayList<>();
//	            double totalOrderPrice = 0;
//
//	            for (OrderItem i : addedItems) {
//	                Map<String, Object> itemMap = new HashMap<>();
//	                itemMap.put("dishId", i.getDish().getId());
//	                itemMap.put("dishName", i.getDish().getName());
//	                itemMap.put("category", i.getDish().getCategory());
//	                itemMap.put("quantity", i.getQuantity());
//	                itemMap.put("price", i.getDish().getPrice());
//	                itemMap.put("totalPrice", i.getDish().getPrice() * i.getQuantity());
//
//	                totalOrderPrice += i.getDish().getPrice() * i.getQuantity();
//	                itemsResponse.add(itemMap);
//	            }
//
//	            Map<String, Object> orderMap = new HashMap<>();
//	            orderMap.put("orderId", order.getId());
//	            orderMap.put("orderCode", order.getOrderCode());
//	            orderMap.put("customerName", order.getCustomerName());
//	            orderMap.put("email", order.getEmail());
//	            orderMap.put("phone", order.getPhone());
//	            orderMap.put("items", itemsResponse);
//	            orderMap.put("totalOrderPrice", totalOrderPrice);
//
//	            allOrdersResponse.add(orderMap);
//	        }
//
//	        return ResponseEntity.ok(allOrdersResponse);
//	    }
//    @GetMapping("/all-details")
//    public ResponseEntity<?> getAllOrderDetails() {
//        List<Map<String, Object>> allOrdersResponse = orderBookingRepository.findAll().stream()
//            .map(order -> {
//                List<Map<String, Object>> itemsResponse = orderItemRepository.findByOrder(order).stream()
//                    .map(i -> {
//                        Map<String, Object> itemMap = new HashMap<>();
//                        itemMap.put("dishId", i.getDish().getId());
//                        itemMap.put("dishName", i.getDish().getName());
//                        itemMap.put("category", i.getDish().getCategory());
//                        itemMap.put("quantity", i.getQuantity());
//                        itemMap.put("price", i.getDish().getPrice());
//                        itemMap.put("totalPrice", i.getDish().getPrice() * i.getQuantity());
//                        return itemMap;
//                    })
//                    .toList();
//
//                double totalOrderPrice = itemsResponse.stream()
//                    .mapToDouble(i -> (double) i.get("totalPrice"))
//                    .sum();
//
//                Map<String, Object> orderMap = new HashMap<>();
//                orderMap.put("orderId", order.getId());
//                orderMap.put("orderCode", order.getOrderCode());
//                orderMap.put("customerName", order.getCustomerName());
//                orderMap.put("email", order.getEmail());
//                orderMap.put("phone", order.getPhone());
//                orderMap.put("items", itemsResponse);
//                orderMap.put("totalOrderPrice", totalOrderPrice);
//
//                return orderMap;
//            })
//            .toList();
//
//        return ResponseEntity.ok(allOrdersResponse);
//    }

    @GetMapping("/all-dishes")
    public ResponseEntity<?> getAllOrderItems() {
        List<OrderBooking> orders = StreamSupport
            .stream(orderBookingRepository.findAll().spliterator(), false)
            .toList();

        List<Map<String, Object>> allOrdersResponse = orders.stream()
            .map(order -> {
                // Lấy danh sách item của order
                List<Map<String, Object>> itemsResponse = orderItemRepository.findByOrder(order).stream()
                    .map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("dishId", item.getDish().getId());
                        map.put("dishName", item.getDish().getName());
                        map.put("category", item.getDish().getCategory());
                        map.put("quantity", item.getQuantity());
                        map.put("price", item.getUnitPrice());
                        map.put("totalPrice", item.getTotalPrice());
                        return map;
                    })
                    .toList();

                double totalOrderPrice = itemsResponse.stream()
                    .mapToDouble(i -> (double) i.get("totalPrice"))
                    .sum();

                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getId());
                orderMap.put("orderCode", order.getOrderCode());
                orderMap.put("customerName", order.getCustomerName());
                orderMap.put("email", order.getEmail());
                orderMap.put("phone", order.getPhone());
                orderMap.put("items", itemsResponse);
                orderMap.put("totalOrderPrice", totalOrderPrice);

                return orderMap;
            })
            .toList();

        return ResponseEntity.ok(allOrdersResponse);
    }
//    @GetMapping("/{orderId}")
//    public ResponseEntity<?> getAllOrderItems(@PathVariable("orderId")  Long orderId) {
//        Optional<OrderBooking> optionalOrder = orderBookingRepository.findById(orderId);
//        if (optionalOrder.isEmpty()) {
//            return ResponseEntity.notFound().build();
//        }
//
//        OrderBooking order = optionalOrder.get();
//
//        // 2. Lấy danh sách item của order
//        List<Map<String, Object>> itemsResponse = orderItemRepository.findByOrder(order).stream()
//            .map(item -> {
//                Map<String, Object> map = new HashMap<>();
//                map.put("dishId", item.getDish().getId());
//                map.put("dishName", item.getDish().getName());
//                map.put("category", item.getDish().getCategory());
//                map.put("quantity", item.getQuantity());
//                map.put("price", item.getUnitPrice());
//                map.put("totalPrice", item.getTotalPrice());
//                return map;
//            })
//            .toList();
//
//        // 3. Tính tổng tiền đơn hàng
//        double totalOrderPrice = itemsResponse.stream()
//            .mapToDouble(i -> (double) i.get("totalPrice"))
//            .sum();
//
//        // 4. Build response
//        Map<String, Object> orderMap = new HashMap<>();
//        orderMap.put("orderId", order.getId());
//        orderMap.put("orderCode", order.getOrderCode());
//        orderMap.put("customerName", order.getCustomerName());
//        orderMap.put("email", order.getEmail());
//        orderMap.put("phone", order.getPhone());
//        orderMap.put("items", itemsResponse);
//        orderMap.put("totalOrderPrice", totalOrderPrice);
//
//        return ResponseEntity.ok(orderMap);
//    }

    @GetMapping("/all-items")
    public ResponseEntity<?> getOrdersWithItems() {
        List<OrderBooking> orders = orderBookingRepository.findAll();

        List<Map<String, Object>> response = orders.stream()
            .map(order -> {
                // Lấy items của order
                List<Map<String, Object>> itemsResponse = orderItemRepository.findByOrder(order).stream()
                    .map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("dishId", item.getDish().getId());
                        map.put("dishName", item.getDish().getName());
                        map.put("category", item.getDish().getCategory());
                        map.put("quantity", item.getQuantity());
                        map.put("price", item.getUnitPrice());
                        map.put("totalPrice", item.getTotalPrice());
                        return map;
                    })
                    .toList();

                // Build order map
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getId());
                orderMap.put("orderCode", order.getOrderCode());
                orderMap.put("customerName", order.getCustomerName());
                orderMap.put("email", order.getEmail());
                orderMap.put("phone", order.getPhone());
                orderMap.put("items", itemsResponse);
                orderMap.put("totalOrderPrice", itemsResponse.stream()
                        .mapToDouble(i -> (double) i.get("totalPrice"))
                        .sum());
                
                return orderMap;
            })
            // Lọc chỉ giữ order có items
            .filter(orderMap -> {
                List<?> items = (List<?>) orderMap.get("items");
                return items != null && !items.isEmpty();
            })
            .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/add-item")
    public ResponseEntity<?> addItemToOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> payload) {

        try {
            // Lấy order từ DB
            OrderBooking order = orderBookingRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Long dishId = Long.valueOf(payload.get("dishId").toString());
            int quantity = Integer.parseInt(payload.get("quantity").toString());

            Dish dish = dishRepository.findById(dishId)
                    .orElseThrow(() -> new RuntimeException("Dish not found"));

            // Tạo item
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setDish(dish);
            item.setQuantity(quantity);
            item.setUnitPrice(dish.getPrice());
            item.setTotalPrice(dish.getPrice() * quantity);

            orderItemRepository.save(item);

            // Emit WebSocket log cho staff
            Map<String, Object> logData = new HashMap<>();
            logData.put("type", "EXTRA_ITEM");
            logData.put("orderId", order.getId());
            logData.put("orderCode", order.getOrderCode());
            logData.put("customerEmail", order.getEmail());
            logData.put("dishName", dish.getName());
            logData.put("quantity", quantity);
            logData.put("time", new Date());

            messagingTemplate.convertAndSend("/topic/staff-logs", logData);

            return ResponseEntity.ok(item);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



}
