package com.mytech.backend.portal.Utils;

import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingItem;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Booking.ItemType;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Combo.ComboItem;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.models.Service.ServiceAvailability;
import com.mytech.backend.portal.models.Service.ServiceTag;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

    private final CustomerRepository customerRepo;
    private final ServiceRepository serviceRepo;
    private final BookingRepository bookingRepo;
    private final ComboRepository comboRepo;
    BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    @Bean
    CommandLineRunner seed(UserRepository userRepository, ServiceAvailabilityRepository serviceAvailabilityRepository) {
        return args -> {
            if (serviceRepo.count() > 0 || customerRepo.count() > 0 || comboRepo.count() > 0) return;

            // --- 1. Tạo User + Customer ---
            User u1 = userRepository.save(User.builder()
                    .name("ADMIN")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0909123456")
                    .role(User.Role.ADMIN)
                    .status(User.Status.ACTIVE)
                    .build());

            Customer c1 = Customer.builder()
                    .firstName("ADMIN")
                    .lastName("MANAGER")
                    .email("admin@gmail.com")
                    .phone("0909123456")
                    .address("Ha Noi")
                    .user(u1)   // 🔗 liên kết User
                    .build();
            customerRepo.save(c1);

            // --- 2. User + Customer khác ---
            User u2 = userRepository.save(User.builder()
                    .name("Tran Binh")
                    .email("staff@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0909988776")
                    .role(User.Role.STAFF)
                    .status(User.Status.ACTIVE)
                    .build());

            Customer c2 = Customer.builder()
                    .firstName("Tran")
                    .lastName("Binh")
                    .email("staff@gmail.com")
                    .phone("0909988776")
                    .address("Da Nang")
                    .user(u2)
                    .build();
            customerRepo.save(c2);

            // --- 2. User + Customer khác ---
            User u5 = userRepository.save(User.builder()
                    .name("Hoai Tam")
                    .email("staff1@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0909988244")
                    .role(User.Role.STAFF)
                    .status(User.Status.ACTIVE)
                    .build());

            Customer c5 = Customer.builder()
                    .firstName("Tran")
                    .lastName("Binh")
                    .email("staff1@gmail.com")
                    .phone("0909988244")
                    .address("Da Nang")
                    .user(u5)
                    .build();
            customerRepo.save(c5);

            // --- 2. User + Customer khác ---
            User u6 = userRepository.save(User.builder()
                    .name("Lê Văn Cường")
                    .email("staff1@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0909988241")
                    .role(User.Role.STAFF)
                    .status(User.Status.ACTIVE)
                    .build());

            Customer c6 = Customer.builder()
                    .firstName("LE")
                    .lastName("CUONG")
                    .email("staff1@gmail.com")
                    .phone("0909988241")
                    .address("Da Nang")
                    .user(u6)
                    .build();
            customerRepo.save(c6);

            // --- Additional Customers ---
            User u3 = userRepository.save(User.builder()
                    .name("Le Cuong")
                    .email("cuong@example.com")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0912345678")
                    .role(User.Role.CUSTOMER)
                    .status(User.Status.ACTIVE)
                    .build());

            Customer c3 = Customer.builder()
                    .firstName("Le")
                    .lastName("Cuong")
                    .email("cuong@example.com")
                    .phone("0912345678")
                    .address("Ho Chi Minh")
                    .user(u3)
                    .build();
            customerRepo.save(c3);

            User u4 = userRepository.save(User.builder()
                    .name("Pham Dung")
                    .email("dung@example.com")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0933445566")
                    .role(User.Role.CUSTOMER)
                    .status(User.Status.ACTIVE)
                    .build());

            Customer c4 = Customer.builder()
                    .firstName("Pham")
                    .lastName("Dung")
                    .email("dung@example.com")
                    .phone("0933445566")
                    .address("Hai Phong")
                    .user(u4)
                    .build();
            customerRepo.save(c4);

            // --- 2. Tạo Service ---
            // Service 1: Camping cơ bản
            Service s1 = serviceRepo.save(Service.builder()
                    .name("Camping cơ bản bên bờ sông")
                    .description("Trải nghiệm cắm trại truyền thống với lều, bếp than và BBQ tại khu đất riêng tư ven sông Củ Chi.")
                    .price(800_000.0)
                    .location("Củ Chi, TP.HCM")
                    .minDays(1).maxDays(2)
                    .minCapacity(3).maxCapacity(6)
                    .tag(ServiceTag.POPULAR)
                    .active(true)
                    .allowExtraPeople(true)
                    .extraFeePerPerson(200000.0)
                    .maxExtraPeople(3)
                    .imageUrl("/uploads/services/camping-song.jpg")
                    .build());

            // Service 2: Glamping sang trọng
            Service s2 = serviceRepo.save(Service.builder()
                    .name("Glamping sang trọng trong rừng cao su")
                    .description("Trải nghiệm glamping cao cấp, lều canvas rộng rãi, giường nệm và điều hòa mini giữa rừng cao su yên tĩnh.")
                    .price(1_800_000.0)
                    .location("Củ Chi, TP.HCM")
                    .minDays(1).maxDays(3)
                    .minCapacity(2).maxCapacity(4)
                    .tag(ServiceTag.NEW)
                    .active(true)
                    .allowExtraPeople(true)
                    .extraFeePerPerson(200000.0)
                    .maxExtraPeople(3)
                    .imageUrl("/uploads/services/glamping-rung.jpg")
                    .build());

            // Service 3: Cắm trại BBQ đêm
            Service s3 = serviceRepo.save(Service.builder()
                    .name("Camping BBQ đêm ven sông")
                    .description("Cắm trại và thưởng thức BBQ buổi tối với bạn bè bên bờ sông, lửa trại và âm nhạc.")
                    .price(950_000.0)
                    .location("Củ Chi, TP.HCM")
                    .minDays(1).maxDays(2)
                    .minCapacity(4).maxCapacity(8)
                    .tag(ServiceTag.POPULAR)
                    .allowExtraPeople(true)
                    .extraFeePerPerson(200000.0)
                    .maxExtraPeople(3)
                    .active(true)
                    .imageUrl("/uploads/services/camping-bbq.jpg")
                    .build());

            // Service 4: Glamping lãng mạn cho cặp đôi
            Service s4 = serviceRepo.save(Service.builder()
                    .name("Glamping lãng mạn cho cặp đôi")
                    .description("Không gian riêng tư, lều glamping sang trọng với trang trí lãng mạn, phù hợp cho couple.")
                    .price(2_200_000.0)
                    .location("Củ Chi, TP.HCM")
                    .minDays(1).maxDays(2)
                    .minCapacity(2).maxCapacity(2)
                    .tag(ServiceTag.DISCOUNT)
                    .allowExtraPeople(true)
                    .extraFeePerPerson(200000.0)
                    .maxExtraPeople(3)
                    .active(true)
                    .imageUrl("/uploads/services/glamping-couple.jpg")
                    .build());

            // Service 5: Camping gia đình cuối tuần
            Service s5 = serviceRepo.save(Service.builder()
                    .name("Camping gia đình cuối tuần")
                    .description("Không gian an toàn, thích hợp cho gia đình có trẻ nhỏ, nhiều hoạt động vui chơi ngoài trời.")
                    .price(1_100_000.0)
                    .location("Củ Chi, TP.HCM")
                    .minDays(2).maxDays(3)
                    .minCapacity(4).maxCapacity(10)
                    .tag(ServiceTag.POPULAR)
                    .allowExtraPeople(true)
                    .extraFeePerPerson(200000.0)
                    .maxExtraPeople(3)
                    .active(true)
                    .imageUrl("/uploads/services/camping-family.jpg")
                    .build());

            // Service 6: Glamping hồ bơi ngoài trời
            Service s6 = serviceRepo.save(Service.builder()
                    .name("Glamping hồ bơi ngoài trời")
                    .description("Lều glamping cạnh hồ bơi, không gian sang trọng với tiện ích cao cấp.")
                    .price(2_500_000.0)
                    .location("Củ Chi, TP.HCM")
                    .minDays(1).maxDays(3)
                    .minCapacity(2).maxCapacity(5)
                    .tag(ServiceTag.NEW)
                    .allowExtraPeople(true)
                    .extraFeePerPerson(200000.0)
                    .maxExtraPeople(3)
                    .active(true)
                    .imageUrl("/uploads/services/glamping-hoboi.jpg")
                    .build());

            // Seed availability (3 ngày tới cho mỗi service, mỗi ngày có 5 slot)
            List<Service> services = List.of(s1, s2, s3, s4, s5, s6);
            LocalDate today = LocalDate.now();
            for (Service s : services) {
                for (int i = 0; i < 3; i++) {
                    serviceAvailabilityRepository.save(ServiceAvailability.builder()
                            .service(s)
                            .date(today.plusDays(i))
                            .totalSlots(5)
                            .bookedSlots(0)
                            .build());
                }
            }


            Service s14 = serviceRepo.save(Service.builder()
                    .name("Tour chèo thuyền Cửu Chân")
                    .description("Khám phá sông nước Cửu Chân bằng thuyền")
                    .price(350_000.0)
                    .location("Thanh Hóa")
                    .active(true)
                            .allowExtraPeople(true)
                            .extraFeePerPerson(200000.0)
                            .maxExtraPeople(3)
                    .imageUrl("/uploads/services/thuyen.jpg")
                    .build());
            // --- 3. Tạo Booking mẫu ---
            // 1. Tạo booking
            Booking booking = Booking.builder()
                    .customer(c1)
                    .checkInDate(LocalDateTime.now().plusDays(5))
                    .checkOutDate(LocalDateTime.now().plusDays(7))
                    .numberOfPeople(2)
                    .note("Kỷ niệm")
                    .status(BookingStatus.PENDING)
                    .build();

// 2. Tạo BookingItem cho service
            BookingItem item = BookingItem.builder()
                    .booking(booking)
                    .service(s1)
                    .type(ItemType.SERVICE)
                    .quantity(1)
                    .price(s1.getPrice())
                    .build();
            // 3. Gán items vào booking
            booking.setItems(List.of(item));

// 4. Lưu booking (cascade sẽ lưu luôn BookingItem nếu cascade.ALL)
            bookingRepo.save(booking);
            // --- 4. Tạo Combo ---
            Combo familyCombo = Combo.builder()
                    .name("Family Camping Pack")
                    .description("Combo gia đình: Camping ven sông + Buffet BBQ + Trekking nhẹ quanh rừng Củ Chi")
                    .price(3_000_000.0)
                    .active(true)
                    .minDays(1).maxDays(3)
                    .maxPeople(8)
                    .discount(15)
                    .duration("3 ngày")
                    .location("Củ Chi, TP.HCM")
                    .imageUrl("/uploads/combos/combo1.jpg")
                    .build();

            Combo adventureCombo = Combo.builder()
                    .name("Adventure Explorer Pack")
                    .description("Combo phiêu lưu: Zipline + Chèo thuyền kayak trên hồ Củ Chi + Trải nghiệm rừng cao su")
                    .price(2_800_000.0)
                    .active(true)
                    .minDays(1).maxDays(2)
                    .maxPeople(4)
                    .discount(10)
                    .imageUrl("/uploads/combos/combo2.jpg")
                    .duration("2 ngày")
                    .location("Củ Chi, TP.HCM")
                    .build();

            Combo natureCombo = Combo.builder()
                    .name("Nature Retreat Pack")
                    .description("Combo thiên nhiên: Trekking trong rừng Củ Chi + Picnic ngoài trời + Hướng dẫn sinh thái")
                    .price(2_500_000.0)
                    .active(true)
                    .minDays(1).maxDays(2)
                    .maxPeople(6)
                    .discount(12)
                    .imageUrl("/uploads/combos/combo3.jpg")
                    .duration("2 ngày")
                    .location("Củ Chi, TP.HCM")
                    .build();

            Combo teamBuildingCombo = Combo.builder()
                    .name("Team Building Pack")
                    .description("Combo nhóm: Các trò chơi tập thể + BBQ ngoài trời + Trải nghiệm sinh tồn nhẹ")
                    .price(3_200_000.0)
                    .active(true)
                    .minDays(1).maxDays(2)
                    .maxPeople(12)
                    .imageUrl("/uploads/combos/combo4.jpg")
                    .discount(15)
                    .duration("2 ngày")
                    .location("Củ Chi, TP.HCM")
                    .build();

            Combo weekendEscapeCombo = Combo.builder()
                    .name("Weekend Escape Pack")
                    .description("Combo cuối tuần: Cắm trại ven hồ + Thuyền nhỏ + BBQ tối + Hoạt động ngoài trời")
                    .price(2_700_000.0)
                    .active(true)
                    .minDays(1).maxDays(2)
                    .maxPeople(6)
                    .imageUrl("/uploads/combos/combo5.jpg")
                    .discount(10)
                    .duration("2 ngày")
                    .location("Củ Chi, TP.HCM")
                    .build();

            Combo riverAdventureCombo = Combo.builder()
                    .name("River Adventure Pack")
                    .description("Combo sông nước: Chèo thuyền kayak + Cắm trại ven sông + BBQ ngoài trời + Trò chơi nhóm")
                    .price(1_800_000.0)
                    .active(true)
                    .minDays(1).maxDays(2)
                    .imageUrl("/uploads/combos/combo6.jpg")
                    .maxPeople(8)
                    .discount(8)
                    .duration("2 ngày")
                    .location("Củ Chi, TP.HCM")
                    .build();

            // --- 5. Tạo ComboItem ---
            ComboItem item1 = ComboItem.builder().combo(familyCombo).service(s1).quantity(1).build();
            ComboItem item2 = ComboItem.builder().combo(familyCombo).service(s2).quantity(1).build();
            ComboItem item3 = ComboItem.builder().combo(familyCombo).service(s3).quantity(4).build(); // cho 4 người
            ComboItem item4 = ComboItem.builder().combo(familyCombo).service(s4).quantity(4).build(); // cho 4 người

            familyCombo.setItems(List.of(item1, item2, item3, item4));

            ComboItem item5 = ComboItem.builder().combo(adventureCombo).service(s5).quantity(1).build();
            ComboItem item6 = ComboItem.builder().combo(adventureCombo).service(s1).quantity(4).build(); // cho 4 người
            ComboItem item7 = ComboItem.builder().combo(adventureCombo).service(s4).quantity(4).build(); // cho 4 người
            adventureCombo.setItems(List.of(item5, item6, item7));

            ComboItem item8 = ComboItem.builder().combo(natureCombo).service(s3).quantity(1).build();
            ComboItem item9 = ComboItem.builder().combo(natureCombo).service(s3).quantity(1).build();
            ComboItem item10 = ComboItem.builder().combo(natureCombo).service(s5).quantity(4).build(); // cho 4 người
            natureCombo.setItems(List.of(item8, item9, item10));

            ComboItem item11 = ComboItem.builder().combo(teamBuildingCombo).service(s5).quantity(1).build();
            ComboItem item12 = ComboItem.builder().combo(teamBuildingCombo).service(s4).quantity(4).build(); // cho 4 người
            ComboItem item13 = ComboItem.builder().combo(teamBuildingCombo).service(s6).quantity(1).build();
            teamBuildingCombo.setItems(List.of(item11, item12, item13));

            ComboItem item14 = ComboItem.builder().combo(weekendEscapeCombo).service(s2).quantity(1).build();
            ComboItem item15 = ComboItem.builder().combo(weekendEscapeCombo).service(s4).quantity(4).build(); // cho 4 người
            ComboItem item16 = ComboItem.builder().combo(weekendEscapeCombo).service(s2).quantity(1).build();
            weekendEscapeCombo.setItems(List.of(item14, item15, item16));

            ComboItem item17 = ComboItem.builder().combo(riverAdventureCombo).service(s14).quantity(4).build(); // cho 4 người
            ComboItem item18 = ComboItem.builder().combo(riverAdventureCombo).service(s6).quantity(1).build();
            ComboItem item19 = ComboItem.builder().combo(riverAdventureCombo).service(s3).quantity(4).build(); // cho 4 người
            riverAdventureCombo.setItems(List.of(item17, item18, item19));

            // --- 6. Lưu Combo + ComboItem ---
            comboRepo.save(familyCombo);
            comboRepo.save(adventureCombo);
            comboRepo.save(natureCombo);
            comboRepo.save(teamBuildingCombo);
            comboRepo.save(weekendEscapeCombo);
            comboRepo.save(riverAdventureCombo);

            System.out.println("DataLoader: Customers, Services, Bookings, Combos đã được seed thành công!");
        };
    }
}

