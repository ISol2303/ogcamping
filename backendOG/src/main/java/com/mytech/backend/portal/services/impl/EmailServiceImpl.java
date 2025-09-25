package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingItem;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.services.EmailService;
import jakarta.mail.internet.MimeMessage;

import java.io.File;

import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public EmailServiceImpl(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Override
    public void sendBookingEmail(OrderBooking order) {
        try {
            if (order == null || order.getEmail() == null) {
                throw new IllegalArgumentException("Order hoặc email không hợp lệ");
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("booking.ogcamping@gmail.com");
            helper.setTo(order.getEmail());
            helper.setSubject("Xác nhận đơn hàng: " + order.getOrderCode());

            // Thymeleaf context
            Context context = new Context();
            context.setVariable("customerName", order.getCustomerName());
            context.setVariable("orderCode", order.getOrderCode());
            context.setVariable("checkinDate", order.getBookingDate());
            context.setVariable("totalPrice", order.getTotalPrice());
            context.setVariable("people", order.getPeople());
            context.setVariable("phone", order.getPhone());
            context.setVariable("specialRequests", order.getSpecialRequests());

            // Render template trước
            String htmlContent = templateEngine.process("order-confirmation", context);

            // Nhúng ảnh logo
            ClassPathResource logo = new ClassPathResource("static/images/ogcamping.jpg");
            helper.setText(htmlContent, true); // Nội dung html trước
            helper.addInline("ogLogo", logo); // Sau đó gắn ảnh inline

            mailSender.send(message);
            System.out.println("✅ Email sent to: " + order.getEmail());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi email: " + e.getMessage());
        }
    }

    @Override
    public void sendBookingEmail(Booking booking) {
        try {
            if (booking == null || booking.getCustomer() == null || booking.getCustomer().getEmail() == null) {
                throw new IllegalArgumentException("Booking hoặc thông tin khách hàng không hợp lệ");
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("booking.ogcamping@gmail.com");
            helper.setTo(booking.getCustomer().getEmail());
            helper.setSubject("Xác nhận Booking #" + booking.getId());

            // 🔥 Thymeleaf context
            Context context = new Context();
            Customer customer = booking.getCustomer();

            context.setVariable("customerName", customer.getName()); // ✅ chỉ lấy field name
            context.setVariable("bookingId", booking.getId());
            context.setVariable("checkinDate", booking.getCheckInDate());
            context.setVariable("checkoutDate", booking.getCheckOutDate());
            context.setVariable("totalAmount", booking.getTotalPrice());
            context.setVariable("status", booking.getStatus());
            context.setVariable("phone", customer.getPhone());
            context.setVariable("email", customer.getEmail());
            context.setVariable("address", customer.getAddress());
            context.setVariable("Note", booking.getNote());

            // Danh sách BookingItem
            List<Map<String, Object>> itemList = booking.getItems().stream().map(item -> {
                Map<String, Object> map = new HashMap<>();

                if (item.getService() != null) {
                    map.put("type", "service");
                    map.put("name", item.getService().getName());
                    map.put("quantity", item.getQuantity());
                    map.put("price", item.getService().getPrice());
                    map.put("subtotal", item.getQuantity() * item.getService().getPrice());
                } else if (item.getCombo() != null) {
                    map.put("type", "combo");
                    map.put("name", item.getCombo().getName());
                    map.put("quantity", item.getQuantity());
                    map.put("price", item.getCombo().getPrice());
                    map.put("subtotal", item.getQuantity() * item.getCombo().getPrice());
                } else if (item.getEquipment() != null) {
                    map.put("type", "equipment");
                    map.put("name", item.getEquipment().getName());
                    map.put("quantity", item.getQuantity());
                    map.put("price", item.getEquipment().getPrice());
                    map.put("subtotal", item.getQuantity() * item.getEquipment().getPrice());
                }

                return map;
            }).toList();

            context.setVariable("items", itemList);

            // Render template HTML
            String htmlContent = templateEngine.process("booking-confirmation", context);

            // Nhúng ảnh logo
            ClassPathResource logo = new ClassPathResource("static/images/ogcamping.jpg");

            helper.setText(htmlContent, true);
            helper.addInline("ogLogo", logo);

            mailSender.send(message);
            System.out.println("✅ Email sent to: " + customer.getEmail());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi email: " + e.getMessage());
        }
    }

    @Override
    public void sendOrderConfirmation(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("booking.ogcamping@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);

            System.out.println("✅ Email sent to: " + to);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi email: " + e.getMessage());
        }
    }

    @Override
    public void sendResetPasswordCode(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);

    }

    @Override
    public void sendBookingConfirmationEmail(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(booking.getCustomer().getEmail());
            helper.setSubject("Xác nhận đơn đặt chỗ - OGCAMPING");
            helper.setFrom("no-reply@ogcamping.vn");

            // Chuẩn bị dữ liệu cho template
            Context context = new Context();
            context.setVariable("customerName", booking.getCustomer().getName());
            context.setVariable("orderId", booking.getId());
            context.setVariable("checkInDate",
                    booking.getCheckInDate() != null ? booking.getCheckInDate().toString() : "-");
            context.setVariable("checkOutDate",
                    booking.getCheckOutDate() != null ? booking.getCheckOutDate().toString() : "-");
            context.setVariable("numberOfPeople",
                    booking.getNumberOfPeople() != null ? booking.getNumberOfPeople() : "-");
            context.setVariable("phone",
                    booking.getCustomer().getPhone() != null ? booking.getCustomer().getPhone() : "-");
            context.setVariable("note", booking.getNote() != null ? booking.getNote() : "Không có");

            // Định dạng totalPrice giống Javascript toLocaleString
            String totalPriceFormatted = booking.getTotalPrice() != null
                    ? String.format("%,.0f", booking.getTotalPrice()) + " ₫"
                    : "0 ₫";
            context.setVariable("totalPriceFormatted", totalPriceFormatted);

            // Xử lý HTML template
            String htmlContent = templateEngine.process("booking_infomation", context);
            helper.setText(htmlContent, true);

            // Nhúng logo inline
            ClassPathResource logo = new 
            ClassPathResource("static/images/ogcamping.jpg");
            helper.setText(htmlContent, true); // Nội dung html trước
            helper.addInline("ogLogo", logo); // Sau đó gắn ảnh inline

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Gửi email thất bại: " + e.getMessage(), e);
        }
    }

}
