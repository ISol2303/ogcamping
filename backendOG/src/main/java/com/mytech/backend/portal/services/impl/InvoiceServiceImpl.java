package com.mytech.backend.portal.services.impl;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.services.InvoiceService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Override
    public byte[] generateInvoicePDF(OrderBooking order) {
        try {
            // 1️⃣ Load HTML template
            ClassPathResource resource = new ClassPathResource("templates/InvoiceTemplate.html");
            String html = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            // 2️⃣ Encode logo Base64
            Path logoPath = Path.of("src/main/resources/static/images/ogcamping.jpg");
            byte[] logoBytes = Files.readAllBytes(logoPath);
            String base64Logo = Base64.getEncoder().encodeToString(logoBytes);

            // 3️⃣ Thay placeholder Base64_IMAGE và các thông tin OrderBooking
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            html = html.replace("{{BASE64_IMAGE}}", base64Logo)
                       .replace("{{ORDER_CODE}}", order.getOrderCode() != null ? order.getOrderCode() : "Chưa có")
                       .replace("{{CUSTOMER_NAME}}", order.getCustomerName())
                       .replace("{{EMAIL}}", order.getEmail())
                       .replace("{{PHONE}}", order.getPhone())
                       .replace("{{BOOKING_DATE}}", 
                                order.getBookingDate() != null ? order.getBookingDate().format(formatter) : "")
                       .replace("{{PEOPLE}}", String.valueOf(order.getPeople()))
                       .replace("{{TOTAL_PRICE}}", String.valueOf(order.getTotalPrice()))
                       .replace("{{SPECIAL_REQUESTS}}", 
                                order.getSpecialRequests() != null ? order.getSpecialRequests() : "Không có")
                       .replace("{{EMERGENCY_CONTACT}}", 
                                order.getEmergencyContact() != null ? order.getEmergencyContact() : "Không có")
                       .replace("{{EMERGENCY_PHONE}}", 
                                order.getEmergencyPhone() != null ? order.getEmergencyPhone() : "Không có");

            // 4️⃣ Convert HTML sang PDF
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                ConverterProperties converterProperties = new ConverterProperties();
                HtmlConverter.convertToPdf(html, outputStream, converterProperties);
                return outputStream.toByteArray();
            }

        } catch (IOException e) {
            throw new RuntimeException("Lỗi tạo PDF cho đơn hàng id=" + order.getId(), e);
        }
    }
}
