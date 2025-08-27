package com.mytech.backend.portal;

import com.github.javafaker.Faker;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.models.User.Role;
import com.mytech.backend.portal.models.User.Status;
import com.mytech.backend.portal.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@SpringBootTest
@Rollback(false)
@AutoConfigureTestDatabase(replace = Replace.NONE)
public class UserServiceTest {

    @Autowired
    private UserService userService;

    private Faker faker;

    @BeforeEach
    void setUp() {
        faker = new Faker();
    }

    @Test
    public void testCreate50Users() {
        List<User> users = new ArrayList<>();
        Random random = new Random();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 0; i < 50; i++) {
            User user = User.builder()
                .name(faker.name().fullName())
                .email(faker.internet().emailAddress())
                .password(faker.internet().password())
                .phone(faker.phoneNumber().cellPhone())
                .role(random.nextBoolean() ? Role.CUSTOMER : Role.STAFF)
                .department(faker.commerce().department())
                .joinDate(LocalDate.now().minusDays(random.nextInt(365)))
                .status(random.nextBoolean() ? Status.ACTIVE : Status.INACTIVE)
                .agreeMarketing(random.nextBoolean())
                .createdAt(LocalDateTime.now())
                .build();

            users.add(user);
            userService.save(user);
        }
    }
}