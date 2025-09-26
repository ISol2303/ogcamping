package com.mytech.backend.portal.apis;

import com.itextpdf.html2pdf.HtmlConverter;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingItem;
import com.mytech.backend.portal.models.Booking.ItemType;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.BookingItemRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;

@RestController
public class PDFBookingDishController {

    private final BookingRepository bookingRepository;
    private final BookingItemRepository bookingItemRepository;

    public PDFBookingDishController(BookingRepository bookingRepository,
                                   BookingItemRepository bookingItemRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingItemRepository = bookingItemRepository;
    }

    @GetMapping("/pdf/bill/booking/dishes/{bookingId}")
    public ResponseEntity<byte[]> generateBookingDishBillPdf(@PathVariable("bookingId") Long bookingId) {
        try {
            // 1️⃣ Lấy booking với customer từ DB (sử dụng JOIN FETCH)
            Booking booking = bookingRepository.findByIdWithCustomer(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Đảm bảo customer được load
            if (booking.getCustomer() == null) {
                throw new RuntimeException("Customer information not found for this booking");
            }

            // Chỉ lấy các BookingItem có type = DISH
            List<BookingItem> dishItems = bookingItemRepository.findByBookingAndType(booking, ItemType.DISH);
            
            if (dishItems.isEmpty()) {
                throw new RuntimeException("No dishes found for this booking");
            }

            // 2️⃣ Đọc file logo và encode Base64
            Path path = Path.of("src/main/resources/static/images/ogcamping.jpg");
            byte[] imageBytes = Files.readAllBytes(path);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // 3️⃣ Build HTML động cho booking dishes
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html><html lang='vi'><head>")
                .append("<meta charset='UTF-8'>")
                .append("<title>OG Camping - Hóa đơn món ăn</title>")
                .append("<style>")
                .append("body { font-family: Arial, sans-serif; margin: 20px; }")
                .append(".header { text-align: center; margin-bottom: 20px; }")
                .append(".company-name { font-size: 24px; font-weight: bold; color: #166534; }")
                .append(".invoice-title { font-size: 20px; font-weight: bold; margin: 20px 0; text-align: center; }")
                .append(".customer-info { margin: 20px 0; }")
                .append(".info-row { margin: 8px 0; }")
                .append("table { width: 100%; border-collapse: collapse; margin-top: 20px; }")
                .append("th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }")
                .append("th { background-color: #f0f0f0; font-weight: bold; }")
                .append(".text-center { text-align: center; }")
                .append(".text-right { text-align: right; }")
                .append(".total-row { font-weight: bold; background-color: #f9f9f9; }")
                .append(".total-amount { color: #d32f2f; font-size: 18px; }")
                .append("</style>")
                .append("</head><body>");

            // Header với logo
            html.append("<div class='header'>")
                .append("<div style='display: flex; align-items: center; justify-content: center; margin-bottom: 16px;'>")
                .append("<img src='data:image/jpeg;base64,").append(base64Image).append("' width='50' height='50' style='margin-right: 12px;'>")
                .append("<span class='company-name'>OG CAMPING</span>")
                .append("</div>")
                .append("<div style='font-size: 14px; color: #666;'>")
                .append("Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM<br>")
                .append("Điện thoại: (028) 1234-5678 | Email: info@ogcamping.com")
                .append("</div>")
                .append("</div>");

            // Tiêu đề hóa đơn
            html.append("<div class='invoice-title'>HÓA ĐƠN MÓN ĂN</div>");

            // Thông tin khách hàng và booking
            String customerName = booking.getCustomer() != null && booking.getCustomer().getName() != null 
                ? booking.getCustomer().getName() : "N/A";
            String customerEmail = booking.getCustomer() != null && booking.getCustomer().getEmail() != null 
                ? booking.getCustomer().getEmail() : "N/A";
            String customerPhone = booking.getCustomer() != null && booking.getCustomer().getPhone() != null 
                ? booking.getCustomer().getPhone() : "N/A";
            String bookingDate = booking.getCreatedAt() != null 
                ? booking.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "N/A";

            html.append("<div class='customer-info'>")
                .append("<div class='info-row'><strong>Mã booking:</strong> #BK").append(booking.getId()).append("</div>")
                .append("<div class='info-row'><strong>Tên khách hàng:</strong> ").append(customerName).append("</div>")
                .append("<div class='info-row'><strong>Email:</strong> ").append(customerEmail).append("</div>")
                .append("<div class='info-row'><strong>Số điện thoại:</strong> ").append(customerPhone).append("</div>")
                .append("<div class='info-row'><strong>Ngày đặt:</strong> ").append(bookingDate).append("</div>")
                .append("</div>");

            // Bảng món ăn
            html.append("<table>")
                .append("<thead>")
                .append("<tr>")
                .append("<th>STT</th>")
                .append("<th>Tên món ăn</th>")
                .append("<th class='text-center'>Số lượng</th>")
                .append("<th class='text-right'>Đơn giá (VNĐ)</th>")
                .append("<th class='text-right'>Thành tiền (VNĐ)</th>")
                .append("</tr>")
                .append("</thead>")
                .append("<tbody>");

            double totalPrice = 0;
            int index = 1;
            
            for (BookingItem item : dishItems) {
                String dishName = item.getDish() != null ? item.getDish().getName() : "N/A";
                int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                double unitPrice = item.getPrice() != null ? (item.getPrice() / quantity) : 0;
                double itemTotal = item.getPrice() != null ? item.getPrice() : 0;
                
                html.append("<tr>")
                    .append("<td class='text-center'>").append(index++).append("</td>")
                    .append("<td>").append(dishName).append("</td>")
                    .append("<td class='text-center'>").append(quantity).append("</td>")
                    .append("<td class='text-right'>").append(String.format("%,.0f", unitPrice)).append("</td>")
                    .append("<td class='text-right'>").append(String.format("%,.0f", itemTotal)).append("</td>")
                    .append("</tr>");
                    
                totalPrice += itemTotal;
            }

            html.append("</tbody>")
                .append("<tfoot>")
                .append("<tr class='total-row'>")
                .append("<td colspan='4' class='text-right'><strong>Tổng cộng:</strong></td>")
                .append("<td class='text-right total-amount'><strong>").append(String.format("%,.0f VNĐ", totalPrice)).append("</strong></td>")
                .append("</tr>")
                .append("</tfoot>")
                .append("</table>");

            // Footer
            html.append("<div style='text-align: center; margin-top: 40px; font-size: 12px; color: #666;'>")
                .append("<p>Cảm ơn quý khách đã sử dụng dịch vụ của OG Camping!</p>")
                .append("<p>Ngày in: ").append(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))).append("</p>")
                .append("</div>");

            html.append("</body></html>");

            // 4️⃣ Convert HTML -> PDF
            ByteArrayOutputStream pdfOutput = new ByteArrayOutputStream();
            HtmlConverter.convertToPdf(html.toString(), pdfOutput);

            // 5️⃣ Trả về PDF
            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=booking_dishes_" + booking.getId() + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfOutput.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(("Error generating PDF: " + e.getMessage()).getBytes());
        }
    }
}
