package com.mytech.backend.portal.apis;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.repositories.OrderBookingRepository;
import com.mytech.backend.portal.services.InvoiceService;

@RestController
@RequestMapping("/apis/orders")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final OrderBookingRepository orderBookingRepository;

    public InvoiceController(InvoiceService invoiceService, OrderBookingRepository orderBookingRepository) {
        this.invoiceService = invoiceService;
        this.orderBookingRepository = orderBookingRepository;
    }

    @GetMapping("/{id}/invoice")
    @PreAuthorize("hasRole('STAFF') or hasRole('USER')")
    public ResponseEntity<byte[]> generateInvoice(@PathVariable("id") Long id) {
        OrderBooking order = orderBookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + id));

        byte[] pdfBytes = invoiceService.generateInvoicePDF(order);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=invoice_" + order.getOrderCode() + ".pdf")
                .body(pdfBytes);
    }

}
