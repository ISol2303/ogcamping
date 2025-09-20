package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Payment.PaymentRequestDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.PaymentRepository;
import com.mytech.backend.portal.services.Payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriUtils;

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

//    @GetMapping("/callback")
//    public ResponseEntity<String> vnPayCallback(@RequestParam Map<String, String> params) {
//        String txnRef = params.get("vnp_TxnRef");
//        String rspCode = params.getOrDefault("vnp_ResponseCode", "99");
//        boolean success = "00".equals(rspCode);
//
//        paymentService.confirmPaymentVNPay(txnRef, success);
//        return ResponseEntity.ok(success ? "Thanh toán thành công" : "Thanh toán thất bại");
//    }
//@GetMapping("/callback")
//public ResponseEntity<Void> vnPayCallback(@RequestParam Map<String, String> params) {
//    try {
//        String txnRef = params.get("vnp_TxnRef");
//        String rspCode = params.getOrDefault("vnp_ResponseCode", "99");
//        boolean success = "00".equals(rspCode);
//
//        PaymentResponseDTO paymentResponse = paymentService.confirmPaymentVNPay(txnRef, success);
//        Long bookingId = paymentResponse.getBookingId();
//        if (bookingId == null) {
//            throw new RuntimeException("BookingId is null from paymentResponse");
//        }
//
//        Booking booking = bookingRepository.findById(bookingId)
//                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
//
//        String status = success ? "success" : "failure";
//
//        long serviceCount = booking.getItems().stream()
//                .filter(item -> item.getType() == ItemType.SERVICE)
//                .count();
//
//        String redirectUrl;
//
//        if (serviceCount == 1 && booking.getItems().size() == 1) {
//            Long serviceId = booking.getItems().stream()
//                    .filter(item -> item.getType() == ItemType.SERVICE)
//                    .map(item -> item.getService().getId())
//                    .findFirst()
//                    .orElse(0L);
//
//            redirectUrl = String.format(
//                    "http://localhost:3000/checkout/success?bookingId=%d&status=%s",
//                    serviceId, bookingId, status
//            );
//        } else {
//            redirectUrl = String.format(
//                    "http://localhost:3000/checkout/success?bookingId=%d&status=%s",
//                    bookingId, status
//            );
//        }
//
//        return ResponseEntity.status(HttpStatus.FOUND)
//                .location(URI.create(redirectUrl))
//                .build();
//
//    } catch (Exception e) {
//        e.printStackTrace();
//        String fallbackUrl = "http://localhost:3000/booking/error?reason=" + UriUtils.encodeQueryParam(e.getMessage(), StandardCharsets.UTF_8);
//        return ResponseEntity.status(HttpStatus.FOUND)
//                .location(URI.create(fallbackUrl))
//                .build();
//    }
//}
@GetMapping("/callback")
public ResponseEntity<Void> vnPayCallback(@RequestParam Map<String, String> params) {
    try {
        String txnRef = params.get("vnp_TxnRef");
        String rspCode = params.getOrDefault("vnp_ResponseCode", "99");
        boolean success = "00".equals(rspCode);

        PaymentResponseDTO paymentResponse = paymentService.confirmPaymentVNPay(txnRef, success);
        Long bookingId = Optional.ofNullable(paymentResponse.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("BookingId is null from paymentResponse"));

        String status = success ? "success" : "failure";

        String redirectUrl = String.format(
                "http://localhost:3000/checkout/success?bookingId=%d&status=%s",
                bookingId, status
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

        String fallbackUrl = String.format(
                "http://localhost:3000/checkout/failure?bookingId=%d&error=%s",
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

}
