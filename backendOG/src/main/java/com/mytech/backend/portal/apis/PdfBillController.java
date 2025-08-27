package com.mytech.backend.portal.apis;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itextpdf.html2pdf.HtmlConverter;

@RestController
public class PdfBillController {

	@GetMapping("/pdf/bill")
	public ResponseEntity<byte[]> generateBillPdf() {
	    try {
	        // 1️⃣ Đọc file logo và encode Base64
	        Path path = Path.of("src/main/resources/static/images/ogcamping.jpg");
	        byte[] imageBytes = Files.readAllBytes(path);
	        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

//	        // 2️⃣ Gắn HTML bill đầy đủ vào đây, thay thế đoạn HTML cũ
//	        String orderCode = "OGC123456";
	        String customerName = "Nguyen Van A";
	        String email = "example@gmail.com";

	        String html = "<!DOCTYPE html><html lang='vi'><head><meta charset='UTF-8'><title>OG Camping Bill</title></head><body>"
	                + "<div style='display:flex;align-items:center;justify-content:center;margin-bottom:16px;'>"
	                + "<img src='data:image/jpeg;base64," + base64Image + "' width='50' height='50' style='margin-right:8px;'>"
	                + "<span style='font-size:24px;font-weight:bold;color:#166534;'>OG CAMPING BILL</span>"
	                + "</div>"
	                + "<div style='margin:12px 0;'>Mã đơn hàng: " + orderCode + "</div>"
	                + "<div style='margin:12px 0;'>Tên khách hàng: " + customerName + "</div>"
	                + "<div style='margin:12px 0;'>Email: " + email + "</div>"
	                + "</body></html>";


	        // 3️⃣ Convert HTML → PDF
	        ByteArrayOutputStream pdfOutput = new ByteArrayOutputStream();
	        HtmlConverter.convertToPdf(html, pdfOutput);
	        byte[] pdfBytes = pdfOutput.toByteArray();

	        // 4️⃣ Trả PDF về trình duyệt
	        return ResponseEntity.ok()
	                .header("Content-Disposition", "inline; filename=bill.pdf")
	                .contentType(MediaType.APPLICATION_PDF)
	                .body(pdfBytes);

	    } catch (IOException e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
}
