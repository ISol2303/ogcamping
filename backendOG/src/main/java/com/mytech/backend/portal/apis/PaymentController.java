package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Payment.PaymentRequestDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Booking.ItemType;
import com.mytech.backend.portal.models.Payment.Payment;
import com.mytech.backend.portal.models.Payment.PaymentStatus;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.PaymentRepository;
import com.mytech.backend.portal.services.Payment.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/apis/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDTO> createPayment(@RequestBody PaymentRequestDTO req) {
        PaymentResponseDTO resp = paymentService.createPayment(req);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/create/mobile")
    public ResponseEntity<PaymentResponseDTO> createMobilePayment(@RequestBody PaymentRequestDTO req) {
        PaymentResponseDTO resp = paymentService.createMobilePayment(req);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> vnPayCallback(@RequestParam Map<String, String> params) {
        try {
            String txnRef = params.get("vnp_TxnRef");
            String rspCode = params.getOrDefault("vnp_ResponseCode", "99");
            boolean success = "00".equals(rspCode);

            PaymentResponseDTO paymentResponse = paymentService.confirmPaymentVNPay(txnRef, success);
            Long bookingId = Optional.ofNullable(paymentResponse.getBookingId())
                    .orElseThrow(() -> new IllegalArgumentException("BookingId is null from paymentResponse"));

            String basePath = success ? "success" : "failure";

            String redirectUrl = String.format(
                    "http://localhost:3000/checkoutBooking/%s?bookingId=%d",
                    basePath, bookingId
            );


            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(redirectUrl))
                    .build();
        } catch (Exception e) {
            log.error("VNPay callback error: {}", e.getMessage(), e);

            // fallback: nếu params có bookingId thì lấy ra, nếu không thì để 0
            Long fallbackBookingId = null;
            try {
                String txnRef = params.get("vnp_TxnRef");
                PaymentResponseDTO tmp = paymentService.findByTransactionId(txnRef); // viết hàm findByTxnRef trong service
                fallbackBookingId = tmp != null ? tmp.getBookingId() : 0L;
            } catch (Exception ignored) {
                fallbackBookingId = 0L;
            }

            // Redirect to website for failure case (original behavior)
            String fallbackUrl = String.format(
                    "http://localhost:3000/checkoutBooking/failure?bookingId=%d&error=%s",
                    fallbackBookingId,
                    UriUtils.encodeQueryParam(e.getMessage(), StandardCharsets.UTF_8)
            );

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(fallbackUrl))
                    .build();
        }
    }

    @GetMapping("/callback/mobile")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Void> vnPayMobileCallback(@RequestParam Map<String, String> params) {
        log.info("=== VNPay mobile callback START ===");
        log.info("Received params: {}", params);
        
        // Simple response first to test connectivity
        try {
            Thread.sleep(100); // Small delay to ensure logs are written
        } catch (InterruptedException ignored) {}
        
        try {
            String txnRef = params.get("vnp_TxnRef");
            String rspCode = params.getOrDefault("vnp_ResponseCode", "99");
            boolean success = "00".equals(rspCode);
            
            log.info("Processing payment - txnRef: {}, rspCode: {}, success: {}", txnRef, rspCode, success);

            PaymentResponseDTO paymentResponse = paymentService.confirmPaymentVNPay(txnRef, success);
            log.info("Payment confirmed: {}", paymentResponse);
            
            Long bookingId = Optional.ofNullable(paymentResponse.getBookingId())
                    .orElseThrow(() -> new IllegalArgumentException("BookingId is null from paymentResponse"));

            String status = success ? "success" : "failure";

            // Redirect trực tiếp đến mobile app deep link
            String redirectUrl = String.format(
                    "ogcamping://payment/result?bookingId=%d&status=%s&txnRef=%s",
                    bookingId, status, txnRef
            );
            
            log.info("Redirecting to: {}", redirectUrl);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(redirectUrl))
                    .build();
        } catch (Exception e) {
            log.error("VNPay mobile callback error: {}", e.getMessage(), e);

            // fallback: nếu params có bookingId thì lấy ra, nếu không thì để 0
            Long fallbackBookingId = null;
            try {
                String txnRef = params.get("vnp_TxnRef");
                PaymentResponseDTO tmp = paymentService.findByTransactionId(txnRef); // viết hàm findByTxnRef trong service
                fallbackBookingId = tmp != null ? tmp.getBookingId() : 0L;
            } catch (Exception ignored) {
                fallbackBookingId = 0L;
            }

            // Redirect về HTML page for failure case
            String fallbackUrl = String.format(
                    "ogcamping://payment/result?bookingId=%d&status=failure&txnRef=%s",
                    fallbackBookingId,
                    UriUtils.encodeQueryParam(e.getMessage(), StandardCharsets.UTF_8)
            );

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(fallbackUrl))
                    .build();
        }
    }

    @GetMapping("/{txnId}")
    public ResponseEntity<PaymentResponseDTO> getPayment(@PathVariable("txnId") String txnId) {
        return ResponseEntity.ok(paymentService.findByTransactionId(txnId));
    }
    
    @GetMapping("/test/mobile-callback")
    public ResponseEntity<String> testMobileCallback(@RequestParam Map<String, String> params) {
        log.info("Test mobile callback received with params: {}", params);
        return ResponseEntity.ok("Mobile callback endpoint is working! Params: " + params.toString());
    }
}
