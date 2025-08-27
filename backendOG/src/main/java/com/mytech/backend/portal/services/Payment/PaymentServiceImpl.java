package com.mytech.backend.portal.services.Payment;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mytech.backend.portal.dto.Payment.PaymentRequestDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Payment.Payment;
import com.mytech.backend.portal.models.Payment.PaymentMethod;
import com.mytech.backend.portal.models.Payment.PaymentStatus;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {
	@Autowired
    private BookingRepository bookingRepository;
	@Autowired
    private PaymentRepository paymentRepository;

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

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .method(req.getMethod())
                .status(PaymentStatus.PENDING)
                .providerTransactionId(UUID.randomUUID().toString())
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);
        booking.setPayment(payment);

        String paymentUrl = null;
        if (req.getMethod() == PaymentMethod.VNPAY) {
            paymentUrl = generateVNPayUrl(booking.getId());
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

    public String generateVNPayUrl(Long bookingId) {
        // Tìm booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // VNPay amount = số tiền * 100 (không có phần thập phân)
        long amount = (long) (booking.getTotalPrice() * 100);

        // Tạo mã tham chiếu giao dịch duy nhất
        String txnRef = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        String createDate = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String expireDate = now.plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        // Tạo map chứa các tham số
        Map<String, String> vnpParams = new TreeMap<>(); // TreeMap tự động sắp xếp theo key
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpayTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", booking.getService().getName().replaceAll("[^a-zA-Z0-9 ]", "").replace(" ", "+"));
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpayReturnUrl);
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);
        vnpParams.put("vnp_IpAddr", "127.0.0.1"); // Nên thay bằng IP thực của client nếu có

        // Tạo hash data
        String hashData = vnpParams.entrySet().stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8).replace("%20", "+"))
                .collect(Collectors.joining("&"));

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
    public PaymentResponseDTO confirmPaymentVNPay(String txnRef, boolean success) {
        Payment payment = paymentRepository.findByProviderTransactionId(txnRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (success) {
            payment.setStatus(PaymentStatus.PAID);
            Booking booking = payment.getBooking();
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .method(payment.getMethod())
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


