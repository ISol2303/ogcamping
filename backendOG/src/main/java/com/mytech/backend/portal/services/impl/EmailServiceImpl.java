package com.mytech.backend.portal.services.impl;

import com.mytech.backend.portal.models.OrderBooking;
import com.mytech.backend.portal.models.Booking.Booking;
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
    public void sendBookingEmail(Booking booking) {
        try {
            if (booking == null || booking.getCustomer() == null || booking.getCustomer().getEmail() == null) {
                throw new IllegalArgumentException("Booking hoặc email khách hàng không hợp lệ");
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("booking.ogcamping@gmail.com");
            helper.setTo(booking.getCustomer().getEmail());
            helper.setSubject("Xác nhận đặt chỗ #" + booking.getId());

            // 👉 Chuẩn bị dữ liệu cho template
            Context context = new Context();
            context.setVariable("customerName", booking.getCustomer().getName());
            context.setVariable("bookingId", booking.getId());
            context.setVariable("checkinDate", booking.getCheckInDate());
            context.setVariable("checkoutDate", booking.getCheckOutDate());
            context.setVariable("totalPrice", booking.calculateTotalPrice());
            context.setVariable("people", booking.getNumberOfPeople());
            context.setVariable("phone", booking.getCustomer().getPhone());
            context.setVariable("specialRequests", booking.getNote());

            // 👉 Render template (resources/templates/booking-confirmation.html)
            String htmlContent = templateEngine.process("booking-confirmation", context);

            // 👉 Nhúng logo
            ClassPathResource logo = new ClassPathResource("static/images/ogcamping.jpg");
            helper.setText(htmlContent, true);
            helper.addInline("ogLogo", logo);

            mailSender.send(message);
            System.out.println("✅ Email sent to: " + booking.getCustomer().getEmail());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi email: " + e.getMessage());
        }
    }

}
