package com.mytech.backend.portal.services.Payment;

import com.mytech.backend.portal.dto.Payment.PaymentRequestDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.models.Booking.Booking;
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
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ServiceAvailabilityRepository serviceAvailabilityRepository;

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

        // Sinh mã giao dịch 1 lần duy nhất (txnRef)
        String txnRef = UUID.randomUUID().toString();

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.calculateTotalPrice().doubleValue())
                .method(req.getMethod())
                .status(PaymentStatus.PENDING)
                .providerTransactionId(txnRef)   // lưu trùng với vnp_TxnRef
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);
        booking.setPayment(payment);

        String paymentUrl = null;
        if (req.getMethod() == PaymentMethod.VNPAY) {
            paymentUrl = generateVNPayUrl(booking.getId(), txnRef);
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

        LocalDateTime now = LocalDateTime.now();
        String createDate = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String expireDate = now.plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpayTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpayReturnUrl);
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);
        vnpParams.put("vnp_IpAddr", "127.0.0.1");

        // Tạo hash data
        String hashData = vnpParams.entrySet().stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8).replace("%20", "+"))
                .collect(Collectors.joining("&"));

        String secureHash = hmacSHA512(vnpayHashSecret, hashData);
        vnpParams.put("vnp_SecureHash", secureHash);

        // Build URL
        return vnpayUrl + "?" + vnpParams.entrySet().stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }


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
    @Override
    @Transactional
    public PaymentResponseDTO confirmPaymentVNPay(String txnRef, boolean success) {
        Payment payment = paymentRepository.findByProviderTransactionId(txnRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

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

        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .method(payment.getMethod())
                .bookingId(booking.getId())
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
                .bookingId(payment.getBooking().getId())
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


