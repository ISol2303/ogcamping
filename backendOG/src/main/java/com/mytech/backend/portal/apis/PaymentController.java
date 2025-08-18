package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Payment.PaymentRequestDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.services.Payment.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/apis/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDTO> createPayment(@RequestBody PaymentRequestDTO req) {
        PaymentResponseDTO resp = paymentService.createPayment(req);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/callback")
    public ResponseEntity<String> vnPayCallback(@RequestParam Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        String rspCode = params.getOrDefault("vnp_ResponseCode", "99");
        boolean success = "00".equals(rspCode);

        paymentService.confirmPaymentVNPay(txnRef, success);
        return ResponseEntity.ok(success ? "Thanh toán thành công" : "Thanh toán thất bại");
    }

    @GetMapping("/{txnId}")
    public ResponseEntity<PaymentResponseDTO> getPayment(@PathVariable String txnId) {
        return ResponseEntity.ok(paymentService.findByTransactionId(txnId));
    }
}
