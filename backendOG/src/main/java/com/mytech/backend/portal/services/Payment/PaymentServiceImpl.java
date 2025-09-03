package com.mytech.backend.portal.services.Payment;

import com.mytech.backend.portal.dto.Payment.PaymentRequestDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.models.Booking.Booking;
<<<<<<< HEAD
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Payment.Payment;
import com.mytech.backend.portal.models.Payment.PaymentMethod;
import com.mytech.backend.portal.models.Payment.PaymentStatus;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
=======
import com.mytech.backend.portal.models.Booking.BookingItem;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Booking.ItemType;
import com.mytech.backend.portal.models.Payment.Payment;
import com.mytech.backend.portal.models.Payment.PaymentMethod;
import com.mytech.backend.portal.models.Payment.PaymentStatus;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.models.Service.ServiceAvailability;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.PaymentRepository;
import com.mytech.backend.portal.repositories.ServiceAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
<<<<<<< HEAD
=======
import java.time.LocalDate;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

<<<<<<< HEAD
@Service
=======
@org.springframework.stereotype.Service
>>>>>>> 4b112d9 (Add or update frontend & backend code)
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
<<<<<<< HEAD
=======
    private final ServiceAvailabilityRepository serviceAvailabilityRepository;
>>>>>>> 4b112d9 (Add or update frontend & backend code)

    @Value("${vnpay.url}")
    private String vnpayUrl;

    @Value("${vnpay.return.url}")
    private String vnpayReturnUrl;

    @Value("${vnpay.tmnCode}")
    private String vnpayTmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnpayHashSecret;

    @Override
    public PaymentResponseDTO createPayment(PaymentRequestDTO req) {
        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING)
            throw new RuntimeException("Only PENDING bookings can be paid");

<<<<<<< HEAD
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .method(req.getMethod())
                .status(PaymentStatus.PENDING)
                .providerTransactionId(UUID.randomUUID().toString())
=======
        // Sinh mã giao dịch 1 lần duy nhất (txnRef)
        String txnRef = UUID.randomUUID().toString();

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.calculateTotalPrice().doubleValue())
                .method(req.getMethod())
                .status(PaymentStatus.PENDING)
                .providerTransactionId(txnRef)   // lưu trùng với vnp_TxnRef
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);
        booking.setPayment(payment);

        String paymentUrl = null;
        if (req.getMethod() == PaymentMethod.VNPAY) {
<<<<<<< HEAD
            paymentUrl = generateVNPayUrl(booking.getId());
=======
            paymentUrl = generateVNPayUrl(booking.getId(), txnRef);
>>>>>>> 4b112d9 (Add or update frontend & backend code)
        }

        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .providerTransactionId(payment.getProviderTransactionId())
                .createdAt(payment.getCreatedAt())
                .paymentUrl(paymentUrl)
                .build();
    }

<<<<<<< HEAD
    public String generateVNPayUrl(Long bookingId) {
        // Tìm booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // VNPay amount = số tiền * 100 (không có phần thập phân)
        long amount = (long) (booking.getTotalPrice() * 100);

        // Tạo mã tham chiếu giao dịch duy nhất
        String txnRef = UUID.randomUUID().toString();
=======
    @Override
    public String generateVNPayUrl(Long bookingId, String txnRef) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Lấy tổng tiền từ booking (đã tính tổng service + combo + equipment)
        long amount = (long) (booking.getTotalPrice() * 100);

        // Lấy tên dịch vụ đầu tiên trong booking item để hiển thị trên VNPay
        String orderInfo = booking.getItems().stream()
                .filter(item -> item.getType() == ItemType.SERVICE)
                .map(item -> item.getService().getName())
                .findFirst()
                .orElse("Booking+Payment");

        // Loại bỏ ký tự đặc biệt & thay space bằng '+'
        orderInfo = orderInfo.replaceAll("[^a-zA-Z0-9 ]", "").replace(" ", "+");

>>>>>>> 4b112d9 (Add or update frontend & backend code)
        LocalDateTime now = LocalDateTime.now();
        String createDate = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String expireDate = now.plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

<<<<<<< HEAD
        // Tạo map chứa các tham số
        Map<String, String> vnpParams = new TreeMap<>(); // TreeMap tự động sắp xếp theo key
=======
        Map<String, String> vnpParams = new TreeMap<>();
>>>>>>> 4b112d9 (Add or update frontend & backend code)
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpayTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
<<<<<<< HEAD
        vnpParams.put("vnp_OrderInfo", booking.getService().getName().replaceAll("[^a-zA-Z0-9 ]", "").replace(" ", "+"));
=======
        vnpParams.put("vnp_OrderInfo", orderInfo);
>>>>>>> 4b112d9 (Add or update frontend & backend code)
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpayReturnUrl);
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);
<<<<<<< HEAD
        vnpParams.put("vnp_IpAddr", "127.0.0.1"); // Nên thay bằng IP thực của client nếu có
=======
        vnpParams.put("vnp_IpAddr", "127.0.0.1");
>>>>>>> 4b112d9 (Add or update frontend & backend code)

        // Tạo hash data
        String hashData = vnpParams.entrySet().stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8).replace("%20", "+"))
                .collect(Collectors.joining("&"));

<<<<<<< HEAD
        // Tạo chữ ký HMAC SHA512
        String secureHash = hmacSHA512(vnpayHashSecret, hashData);

        // Thêm secure hash vào params
        vnpParams.put("vnp_SecureHash", secureHash);

        // Tạo URL thanh toán
        String paymentUrl = vnpayUrl + "?" + vnpParams.entrySet().stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        // In log để debug
        System.out.println("Hash data = " + hashData);
        System.out.println("Secure hash = " + secureHash);

        return paymentUrl;
    }

=======
        String secureHash = hmacSHA512(vnpayHashSecret, hashData);
        vnpParams.put("vnp_SecureHash", secureHash);

        // Build URL
        return vnpayUrl + "?" + vnpParams.entrySet().stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }


>>>>>>> 4b112d9 (Add or update frontend & backend code)
    private String hmacSHA512(String secretKey, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC SHA512", e);
        }
    }
<<<<<<< HEAD


    @Override
=======
    @Override
    @Transactional
>>>>>>> 4b112d9 (Add or update frontend & backend code)
    public PaymentResponseDTO confirmPaymentVNPay(String txnRef, boolean success) {
        Payment payment = paymentRepository.findByProviderTransactionId(txnRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

<<<<<<< HEAD
        if (success) {
            payment.setStatus(PaymentStatus.PAID);
            Booking booking = payment.getBooking();
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
=======
        Booking booking = payment.getBooking();

        if (success) {
            payment.setStatus(PaymentStatus.PAID);

            if (!booking.getStatus().equals(BookingStatus.CONFIRMED)) {
                booking.setStatus(BookingStatus.CONFIRMED);

                // Cập nhật bookedSlots cho tất cả Service items trong booking
                for (BookingItem item : booking.getItems()) {
                    if (item.getType() == ItemType.SERVICE && item.getService() != null) {
                        Service service = item.getService();

                        if (item.getCheckInDate() == null || item.getCheckOutDate() == null) {
                            throw new RuntimeException("Missing check-in/check-out date for service " + service.getName());
                        }

                        LocalDate current = item.getCheckInDate();
                        while (!current.isAfter(item.getCheckOutDate().minusDays(1))) {
                            LocalDate dateToCheck = current;

                            ServiceAvailability availability = serviceAvailabilityRepository
                                    .findByServiceIdAndDate(service.getId(), dateToCheck)
                                    .orElseThrow(() -> new RuntimeException(
                                            "No availability config for service " + service.getName() + " on date: " + dateToCheck));

                            if (availability.getBookedSlots() >= availability.getTotalSlots()) {
                                throw new RuntimeException("No available slots on " + dateToCheck + " for service: " + service.getName());
                            }

                            availability.setBookedSlots(availability.getBookedSlots() + 1);
                            serviceAvailabilityRepository.save(availability);

                            current = current.plusDays(1);
                        }
                    }
                }


                bookingRepository.save(booking);
            }

        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

>>>>>>> 4b112d9 (Add or update frontend & backend code)
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .method(payment.getMethod())
<<<<<<< HEAD
=======
                .bookingId(booking.getId())
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .providerTransactionId(payment.getProviderTransactionId())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    @Override
    public PaymentResponseDTO findByTransactionId(String txnId) {
        Payment payment = paymentRepository.findByProviderTransactionId(txnId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return PaymentResponseDTO.builder()
                .id(payment.getId())
<<<<<<< HEAD
=======
                .bookingId(payment.getBooking().getId())
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                .method(payment.getMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .providerTransactionId(payment.getProviderTransactionId())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private Booking updateBookingStatus(Booking booking, BookingStatus status) {
        booking.setStatus(status);
        return booking;
    }
}


