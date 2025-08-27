package com.mytech.backend.portal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.mytech.backend.portal.services.EmailService;

@SpringBootTest
class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @Test
    void testSendEmail() {
        emailService.sendOrderConfirmation(
                "tranminhnhat2005a@gmail.com",
                "Test gửi mail",
                "Hello, đây là email test từ OGCAMPING!"
        );
    }
}
