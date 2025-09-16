package com.mytech.backend.portal.apis;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.itextpdf.html2pdf.HtmlConverter;
import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.models.OrderItem;
import com.mytech.backend.portal.repositories.OrderBookingRepository;
import com.mytech.backend.portal.repositories.OrderItemRepository;

@RestController
public class PDFBILLDISHController {

    private final OrderBookingRepository orderBookingRepository;
    private final OrderItemRepository orderItemRepository;

    public PDFBILLDISHController(OrderBookingRepository orderBookingRepository,
                             OrderItemRepository orderItemRepository) {
        this.orderBookingRepository = orderBookingRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @GetMapping("/pdf/bill/dishes/{orderId}")
    public ResponseEntity<byte[]> generateBillPdf(@PathVariable("orderId") Long orderId) {
        try {
            // 1️⃣ Lấy order và items từ DB
            OrderBooking order = orderBookingRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            List<OrderItem> items = orderItemRepository.findByOrder(order);

            // 2️⃣ Đọc file logo và encode Base64
            Path path = Path.of("src/main/resources/static/images/ogcamping.jpg");
            byte[] imageBytes = Files.readAllBytes(path);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // 3️⃣ Build HTML động
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html><html lang='vi'><head><meta charset='UTF-8'><title>OG Camping Bill</title></head><body>");
            html.append("<div style='display:flex;align-items:center;justify-content:center;margin-bottom:16px;'>")
                .append("<img src='data:image/jpeg;base64,").append(base64Image).append("' width='40' height='40' style='margin-right:8px;'>")
                .append("<span style='font-size:24px;font-weight:bold;color:#166534;'>OG CAMPING BILL</span>")
                .append("</div>");

            html.append("<div style='margin:8px 0;'>Mã đơn hàng: ").append(order.getOrderCode()).append("</div>");
            html.append("<div style='margin:8px 0;'>Tên khách hàng: ").append(order.getCustomerName()).append("</div>");
            html.append("<div style='margin:8px 0;'>Email: ").append(order.getEmail()).append("</div>");
            html.append("<div style='margin:8px 0;'>SĐT: ").append(order.getPhone()).append("</div>");

            html.append("<table style='width:100%;border-collapse:collapse;margin-top:12px;'>")
                .append("<thead>")
                .append("<tr style='background-color:#f0f0f0;'>")
                .append("<th style='border:1px solid #ccc;padding:6px;text-align:left;'>Tên món</th>")
                .append("<th style='border:1px solid #ccc;padding:6px;text-align:center;'>SL</th>")
                .append("<th style='border:1px solid #ccc;padding:6px;text-align:right;'>Giá (VNĐ)</th>")
                .append("<th style='border:1px solid #ccc;padding:6px;text-align:right;'>Tổng (VNĐ)</th>")
                .append("</tr>")
                .append("</thead>")
                .append("<tbody>");

            double totalPrice = 0;
            for (OrderItem item : items) {
                html.append("<tr>")
                    .append("<td style='border:1px solid #ccc;padding:6px;'>").append(item.getDish().getName()).append("</td>")
                    .append("<td style='border:1px solid #ccc;padding:6px;text-align:center;'>").append(item.getQuantity()).append("</td>")
                    .append("<td style='border:1px solid #ccc;padding:6px;text-align:right;'>").append(String.format("%,.0f", item.getUnitPrice())).append("</td>")
                    .append("<td style='border:1px solid #ccc;padding:6px;text-align:right;'>").append(String.format("%,.0f", item.getTotalPrice())).append("</td>")
                    .append("</tr>");
                totalPrice += item.getTotalPrice();
            }

            html.append("</tbody></table>");
            html.append("<div style='text-align:right;margin-top:12px;font-weight:bold;color:#d32f2f;'>Tổng cộng: ").append(String.format("%,.0f VNĐ", totalPrice)).append("</div>");

            html.append("</body></html>");

            // 4️⃣ Convert HTML -> PDF
            ByteArrayOutputStream pdfOutput = new ByteArrayOutputStream();
            HtmlConverter.convertToPdf(html.toString(), pdfOutput);

            // 5️⃣ Trả về PDF
            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=bill_" + order.getOrderCode() + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfOutput.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
