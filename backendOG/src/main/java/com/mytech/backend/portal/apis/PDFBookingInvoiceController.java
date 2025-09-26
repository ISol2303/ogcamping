package com.mytech.backend.portal.apis;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itextpdf.html2pdf.HtmlConverter;
import com.mytech.backend.portal.dto.Booking.BookingItemResponseDTO;
import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.services.Booking.BookingService;

import jakarta.persistence.criteria.CriteriaBuilder.In;

@RestController
@RequestMapping("/pdf/bill")
public class PDFBookingInvoiceController {

    private final BookingService bookingService;

    public PDFBookingInvoiceController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    private String formatBookingDate(LocalDateTime date) {
        if (date == null)
            return "-";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        return date.format(formatter);
    }

    private LocalDateTime getCheckInDate(BookingResponseDTO booking) {
        if (booking.getCheckInDate() != null && booking.getCheckOutDate() != null) {
            return booking.getCheckInDate();
        }
        if (booking.getServices() != null) {
            for (BookingItemResponseDTO s : booking.getServices()) {
                if (s.getCheckInDate() != null && s.getCheckOutDate() != null) {
                    return s.getCheckInDate();
                }
            }
        }
        if (booking.getCombos() != null) {
            for (BookingItemResponseDTO c : booking.getCombos()) {
                if (c.getCheckInDate() != null && c.getCheckOutDate() != null) {
                    return c.getCheckInDate();
                }
            }
        }
        return null;
    }

    private LocalDateTime getCheckOutDate(BookingResponseDTO booking) {
        if (booking.getCheckInDate() != null && booking.getCheckOutDate() != null) {
            return booking.getCheckOutDate();
        }
        if (booking.getServices() != null) {
            for (BookingItemResponseDTO s : booking.getServices()) {
                if (s.getCheckInDate() != null && s.getCheckOutDate() != null) {
                    return s.getCheckOutDate();
                }
            }
        }
        if (booking.getCombos() != null) {
            for (BookingItemResponseDTO c : booking.getCombos()) {
                if (c.getCheckInDate() != null && c.getCheckOutDate() != null) {
                    return c.getCheckOutDate();
                }
            }
        }
        return null;
    }

    private Long getNumberOfPeople(BookingResponseDTO booking) {
        if (booking.getNumberOfPeople() != null) {
            return booking.getNumberOfPeople().longValue(); // ép kiểu Integer → Long
        }
        if (booking.getServices() != null) {
            for (BookingItemResponseDTO s : booking.getServices()) {
                if (s.getNumberOfPeople() != null) {
                    return s.getNumberOfPeople();
                }
            }
        }
        if (booking.getCombos() != null) {
            for (BookingItemResponseDTO c : booking.getCombos()) {
                if (c.getNumberOfPeople() != null) {
                    return c.getNumberOfPeople();
                }
            }
        }
        if (booking.getEquipments() != null) {
            for (BookingItemResponseDTO e : booking.getEquipments()) {
                if (e.getNumberOfPeople() != null) {
                    return e.getNumberOfPeople();
                }
            }
        }
        return null;
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> generateBookingInvoice(@PathVariable("id") Long bookingId) {
        try {
            BookingResponseDTO booking = bookingService.getBooking(bookingId);

            // Logo
            Path logoPath = Path.of("src/main/resources/static/images/ogcamping.jpg");
            byte[] imageBytes = Files.readAllBytes(logoPath);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // Gộp tất cả items
            // Bằng:
            List<BookingItemResponseDTO> allItems = new ArrayList<>();
            if (booking.getServices() != null)
                allItems.addAll(booking.getServices());
            if (booking.getCombos() != null)
                allItems.addAll(booking.getCombos());
            if (booking.getEquipments() != null)
                allItems.addAll(booking.getEquipments());

            // HTML + CSS chuyên nghiệp
            StringBuilder html = new StringBuilder();
            html.append("<html lang='vi'><head><meta charset='UTF-8'>")
                    .append("<title>Invoice</title>")
                    .append("<style>")
                    // ===== Reset & font =====
                    .append("body { font-family: 'Arial', sans-serif; color: #333; margin: 0; padding: 20px; }")
                    .append("h2, h3 { margin: 0; }")
                    // ===== Header =====
                    .append(".header { text-align: center; margin-bottom: 20px; }")
                    .append(".header img { width: 80px; height: 80px; }")
                    .append(".header h2 { color: #2E86C1; margin-top: 5px; }")
                    // ===== Customer info =====
                    .append(".customer-info, .booking-info { margin-bottom: 20px; }")
                    .append(".customer-info p, .booking-info p { margin: 2px 0; }")
                    // ===== Table =====
                    .append("table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }")
                    .append("table th, table td { border: 1px solid #ddd; padding: 8px; }")
                    .append("table th { background-color: #2E86C1; color: white; text-align: left; }")
                    .append("table td { text-align: left; }")
                    .append("table td.number { text-align: right; }")
                    // ===== Total =====
                    .append(".total { text-align: right; font-size: 18px; color: #C0392B; margin-top: 10px; }")
                    // ===== Footer =====
                    .append(".footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; }")
                    .append("</style>")
                    .append("</head><body>");

            // Header
            html.append("<div class='header'>")
                    .append("<img src='data:image/jpeg;base64,").append(base64Image).append("' alt='Logo'>")
                    .append("<h2>OG CAMPING INVOICE</h2>")
                    .append("</div>");

            // Customer info
            html.append("<div class='customer-info'>")
                    .append("<h3>Thông tin khách hàng</h3>")
                    .append("<p><strong>Mã đơn hàng:</strong> ").append(booking.getId()).append("</p>")
                    .append("<p><strong>Tên:</strong> ").append(booking.getCustomerName()).append("</p>")
                    .append("<p><strong>Email:</strong> ").append(booking.getEmail()).append("</p>")
                    .append("<p><strong>SĐT:</strong> ").append(booking.getPhone()).append("</p>")
                    .append("<p><strong>Địa chỉ:</strong> ")
                    .append(booking.getAddress() != null ? booking.getAddress() : "-").append("</p>")
                    .append("</div>");

            // Booking info (sử dụng helper logic ưu tiên Booking → Service → Combo)
            html.append("<div class='booking-info'>")
                    .append("<h3>Thông tin đặt phòng</h3>")
                    .append("<p><strong>Check-in:</strong> ")
                    .append(formatBookingDate(getCheckInDate(booking))).append("</p>")
                    .append("<p><strong>Check-out:</strong> ")
                    .append(formatBookingDate(getCheckOutDate(booking))).append("</p>")
                    .append("<p><strong>Số người:</strong> ")
                    .append(getNumberOfPeople(booking) != null ? getNumberOfPeople(booking) : "-")
                    .append("</p>")
                    .append("</div>");

            // Table items
            html.append("<h3>Dịch vụ / Combo / Thiết bị</h3>");
            html.append("<table>")
                    .append("<tr><th>Tên</th><th>SL</th><th>Giá</th><th>Tổng</th></tr>");

            double totalPrice = 0;
            for (BookingItemResponseDTO item : allItems) {
                html.append("<tr>")
                        .append("<td>").append(item.getName()).append("</td>")
                        .append("<td class='number'>").append(item.getQuantity() != null ? item.getQuantity() : 1)
                        .append("</td>")
                        .append("<td class='number'>").append(String.format("%,.0f", item.getPrice())).append("</td>")
                        .append("<td class='number'>").append(String.format("%,.0f", item.getTotal())).append("</td>")
                        .append("</tr>");
                totalPrice += item.getTotal();
            }
            html.append("</table>");

            // Total
            html.append("<div class='total'><strong>Tổng cộng: ").append(String.format("%,.0f VNĐ", totalPrice))
                    .append("</strong></div>");

            // Footer
            html.append("<div class='footer'>Cảm ơn quý khách đã sử dụng dịch vụ OG Camping!</div>");

            html.append("</body></html>");

            // Convert HTML -> PDF
            ByteArrayOutputStream pdfOutput = new ByteArrayOutputStream();
            HtmlConverter.convertToPdf(html.toString(), pdfOutput);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=invoice_" + booking.getId() + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfOutput.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi tạo PDF: " + e.getMessage()).getBytes());
        }
    }
}
