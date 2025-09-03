package com.mytech.backend.portal.Utils;

import com.mytech.backend.portal.models.Booking.Booking;
<<<<<<< HEAD
import com.mytech.backend.portal.models.Booking.BookingStatus;
=======
import com.mytech.backend.portal.models.Booking.BookingItem;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Booking.ItemType;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Combo.ComboItem;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Service.Service;
<<<<<<< HEAD
=======
import com.mytech.backend.portal.models.Service.ServiceAvailability;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
import com.mytech.backend.portal.models.Service.ServiceTag;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

    private final CustomerRepository customerRepo;
    private final ServiceRepository serviceRepo;
    private final BookingRepository bookingRepo;
    private final ComboRepository comboRepo;

    @Bean
<<<<<<< HEAD
    CommandLineRunner seed(UserRepository userRepository) {
=======
    CommandLineRunner seed(UserRepository userRepository, ServiceAvailabilityRepository serviceAvailabilityRepository) {
>>>>>>> 4b112d9 (Add or update frontend & backend code)
        return args -> {
            if (serviceRepo.count() > 0 || customerRepo.count() > 0 || comboRepo.count() > 0) return;

            // --- 1. Tạo User + Customer ---
            User u1 = userRepository.save(User.builder()
                    .name("Nguyen An")
<<<<<<< HEAD
                    .email("an@example.com")
                    .password("123456")
                    .phone("0909123456")
                    .role(User.Role.CUSTOMER)
=======
                    .email("admin@gmail.com")
                    .password("$2a$12$.OtJEBcerbJuF4byp8v1KO8vgS/Anx90qtuYzhO4R2x.H0Unl1JzS")
                    .phone("0909123456")
                    .role(User.Role.ADMIN)
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                    .status(User.Status.ACTIVE)
                    .build());

            Customer c1 = Customer.builder()
                    .firstName("Nguyen")
                    .lastName("An")
                    .email("an@example.com")
                    .phone("0909123456")
                    .address("Ha Noi")
                    .user(u1)   // 🔗 liên kết User
                    .build();
            customerRepo.save(c1);

            // --- 2. User + Customer khác ---
            User u2 = userRepository.save(User.builder()
                    .name("Tran Binh")
                    .email("binh@example.com")
                    .password("123456")
                    .phone("0909988776")
                    .role(User.Role.CUSTOMER)
                    .status(User.Status.ACTIVE)
                    .build());

            Customer c2 = Customer.builder()
                    .firstName("Tran")
                    .lastName("Binh")
                    .email("binh@example.com")
                    .phone("0909988776")
                    .address("Da Nang")
                    .user(u2)
                    .build();
            customerRepo.save(c2);

            // --- Additional Customers ---
            User u3 = userRepository.save(User.builder()
                    .name("Le Cuong")
                    .email("cuong@example.com")
                    .password("123456")
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
                    .password("123456")
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
<<<<<<< HEAD
            Service s1 = serviceRepo.save(Service.builder()
                    .name("Glamping view hồ Sapa")
                    .description("Lều cao cấp cạnh hồ")
                    .price(1_200_000.0)
                    .location("Sapa, Lào Cai")
                    .minDays(1).maxDays(2)
                    .minCapacity(2).maxCapacity(6)
                    .availableSlots(3)
                    .tag(ServiceTag.POPULAR)
                    .active(true)
                    .imageUrl("/uploads/services/sapaho.jpg")
                    .build());

            Service s2 = serviceRepo.save(Service.builder()
                    .name("Camping rừng thông Đà Lạt")
                    .description("Trải nghiệm giữa rừng thông")
                    .price(800_000.0)
                    .location("Đà Lạt")
                    .minDays(2).maxDays(4)
                    .minCapacity(2).maxCapacity(8)
                    .availableSlots(5)
                    .tag(ServiceTag.NEW)
                    .active(true)
                    .imageUrl("/uploads/services/dalat.png")
                    .build());

            Service s3 = serviceRepo.save(Service.builder()
                    .name("Buffet BBQ ngoài trời")
                    .description("Buffet BBQ cho gia đình")
                    .price(500_000.0)
                    .location("Sapa")
                    .active(true)
                    .imageUrl("/uploads/services/ngoaitoi.jpg")
                    .build());

            Service s4 = serviceRepo.save(Service.builder()
                    .name("Trekking Tour Sapa")
                    .description("Tour trekking khám phá núi Sapa")
                    .price(300_000.0)
                    .location("Sapa")
                    .active(true)
                    .imageUrl("/uploads/services/sapa.webp")
                    .build());

            Service s5 = serviceRepo.save(Service.builder()
                    .name("Glamping biển Phú Quốc")
                    .description("Lều sang trọng bên bờ biển")
                    .price(1_500_000.0)
                    .location("Phú Quốc, Kiên Giang")
                    .minDays(1).maxDays(3)
                    .minCapacity(2).maxCapacity(4)
                    .availableSlots(4)
                    .tag(ServiceTag.POPULAR)
                    .active(true)
                    .imageUrl("/uploads/services/phuquoc.jpg")
                    .build());

            Service s6 = serviceRepo.save(Service.builder()
                    .name("Camping đồi cát Mũi Né")
                    .description("Trải nghiệm cắm trại trên đồi cát")
                    .price(900_000.0)
                    .location("Mũi Né, Bình Thuận")
                    .minDays(2).maxDays(5)
                    .minCapacity(2).maxCapacity(10)
                    .availableSlots(6)
                    .tag(ServiceTag.NEW)
                    .active(true)
                    .imageUrl("/uploads/services/muine.jpg")
                    .build());

            Service s7 = serviceRepo.save(Service.builder()
                    .name("Buffet hải sản Nha Trang")
                    .description("Tiệc hải sản tươi ngon bên bờ biển")
                    .price(600_000.0)
                    .location("Nha Trang, Khánh Hòa")
                    .active(true)
                    .imageUrl("/uploads/services/nhatrang.webp")
                    .build());

            Service s8 = serviceRepo.save(Service.builder()
                    .name("Tour kayak Vịnh Hạ Long")
                    .description("Khám phá Vịnh Hạ Long bằng kayak")
                    .price(450_000.0)
                    .location("Hạ Long, Quảng Ninh")
                    .active(true)
                    .imageUrl("/uploads/services/hlong.jpg")
                    .build());

            Service s9 = serviceRepo.save(Service.builder()
                    .name("Glamping núi Bà Nà")
                    .description("Cắm trại cao cấp trên đỉnh Bà Nà")
                    .price(1_300_000.0)
                    .location("Bà Nà, Đà Nẵng")
                    .minDays(1).maxDays(2)
                    .minCapacity(2).maxCapacity(5)
                    .availableSlots(3)
                    .tag(ServiceTag.POPULAR)
                    .active(true)
                    .imageUrl("/uploads/services/bana.jpg")
                    .build());

            Service s10 = serviceRepo.save(Service.builder()
                    .name("Camping hồ Ba Bể")
                    .description("Trải nghiệm cắm trại ven hồ Ba Bể")
                    .price(700_000.0)
                    .location("Ba Bể, Bắc Kạn")
                    .minDays(2).maxDays(4)
                    .minCapacity(2).maxCapacity(6)
                    .availableSlots(5)
                    .tag(ServiceTag.NEW)
                    .active(true)
                    .imageUrl("/uploads/services/aaaa2323.jpg")
                    .build());

            Service s11 = serviceRepo.save(Service.builder()
                    .name("Buffet nướng Đà Lạt")
                    .description("Tiệc nướng ngoài trời giữa rừng thông")
                    .price(550_000.0)
                    .location("Đà Lạt, Lâm Đồng")
                    .active(true)
                    .imageUrl("/uploads/services/bbqno1dalat2.jpg")
                    .build());

            Service s12 = serviceRepo.save(Service.builder()
                    .name("Tour leo núi Fansipan")
                    .description("Chinh phục đỉnh Fansipan")
                    .price(800_000.0)
                    .location("Sapa, Lào Cai")
                    .active(true)
                    .imageUrl("/uploads/services/ve-cap-treo-sapa-3-2-scaled.jpg")
                    .build());

            Service s13 = serviceRepo.save(Service.builder()
                    .name("Glamping đồng cỏ Cát Tiên")
                    .description("Lều cao cấp giữa đồng cỏ xanh mướt")
                    .price(1_100_000.0)
                    .location("Cát Tiên, Lâm Đồng")
                    .minDays(1).maxDays(3)
                    .minCapacity(2).maxCapacity(6)
                    .availableSlots(4)
                    .tag(ServiceTag.POPULAR)
                    .active(true)
                    .imageUrl("/uploads/services/TVlTj9FI.jpg")
                    .build());

=======
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


>>>>>>> 4b112d9 (Add or update frontend & backend code)
            Service s14 = serviceRepo.save(Service.builder()
                    .name("Tour chèo thuyền Cửu Chân")
                    .description("Khám phá sông nước Cửu Chân bằng thuyền")
                    .price(350_000.0)
                    .location("Thanh Hóa")
                    .active(true)
<<<<<<< HEAD
                    .imageUrl("/uploads/services/thuyen.jpg")
                    .build());
            // --- 3. Tạo Booking mẫu ---
            bookingRepo.save(Booking.builder()
                    .customer(c1)
                    .service(s1)
=======
                            .allowExtraPeople(true)
                            .extraFeePerPerson(200000.0)
                            .maxExtraPeople(3)
                    .imageUrl("/uploads/services/thuyen.jpg")
                    .build());
            // --- 3. Tạo Booking mẫu ---
            // 1. Tạo booking
            Booking booking = Booking.builder()
                    .customer(c1)
>>>>>>> 4b112d9 (Add or update frontend & backend code)
                    .checkInDate(LocalDate.now().plusDays(5))
                    .checkOutDate(LocalDate.now().plusDays(7))
                    .numberOfPeople(2)
                    .note("Kỷ niệm")
                    .status(BookingStatus.PENDING)
<<<<<<< HEAD
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c2)
                    .service(s2)
                    .checkInDate(LocalDate.now().plusDays(10))
                    .checkOutDate(LocalDate.now().plusDays(12))
                    .numberOfPeople(4)
                    .note("Team building")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c3)
                    .service(s5)
                    .checkInDate(LocalDate.now().plusDays(8))
                    .checkOutDate(LocalDate.now().plusDays(10))
                    .numberOfPeople(3)
                    .note("Kỳ nghỉ gia đình")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c4)
                    .service(s6)
                    .checkInDate(LocalDate.now().plusDays(15))
                    .checkOutDate(LocalDate.now().plusDays(18))
                    .numberOfPeople(6)
                    .note("Chuyến đi nhóm")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c4)
                    .service(s7)
                    .checkInDate(LocalDate.now().plusDays(3))
                    .checkOutDate(LocalDate.now().plusDays(3))
                    .numberOfPeople(4)
                    .note("Tiệc sinh nhật")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c1)
                    .service(s8)
                    .checkInDate(LocalDate.now().plusDays(20))
                    .checkOutDate(LocalDate.now().plusDays(20))
                    .numberOfPeople(2)
                    .note("Khám phá Hạ Long")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c3)
                    .service(s9)
                    .checkInDate(LocalDate.now().plusDays(12))
                    .checkOutDate(LocalDate.now().plusDays(14))
                    .numberOfPeople(5)
                    .note("Nghỉ dưỡng")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c1)
                    .service(s10)
                    .checkInDate(LocalDate.now().plusDays(25))
                    .checkOutDate(LocalDate.now().plusDays(28))
                    .numberOfPeople(4)
                    .note("Cắm trại ven hồ")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c2)
                    .service(s11)
                    .checkInDate(LocalDate.now().plusDays(7))
                    .checkOutDate(LocalDate.now().plusDays(7))
                    .numberOfPeople(6)
                    .note("Tiệc nướng ngoài trời")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c3)
                    .service(s12)
                    .checkInDate(LocalDate.now().plusDays(30))
                    .checkOutDate(LocalDate.now().plusDays(30))
                    .numberOfPeople(2)
                    .note("Chinh phục Fansipan")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c4)
                    .service(s13)
                    .checkInDate(LocalDate.now().plusDays(18))
                    .checkOutDate(LocalDate.now().plusDays(20))
                    .numberOfPeople(3)
                    .note("Trải nghiệm đồng cỏ")
                    .status(BookingStatus.PENDING)
                    .build());

            bookingRepo.save(Booking.builder()
                    .customer(c2)
                    .service(s14)
                    .checkInDate(LocalDate.now().plusDays(5))
                    .checkOutDate(LocalDate.now().plusDays(5))
                    .numberOfPeople(4)
                    .note("Chèo thuyền khám phá")
                    .status(BookingStatus.PENDING)
                    .build());
=======
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
>>>>>>> 4b112d9 (Add or update frontend & backend code)
            // --- 4. Tạo Combo ---
            Combo familyCombo = Combo.builder()
                    .name("Family Camping Pack")
                    .description("Combo gia đình: Camping Sapa + Glamping Hạ Long + Buffet BBQ + Trekking Tour")
                    .price(3_000_000.0)
                    .active(true)
                    .build();

            Combo adventureCombo = Combo.builder()
                    .name("Adventure Explorer Pack")
                    .description("Combo phiêu lưu: Glamping biển Phú Quốc + Tour kayak Vịnh Hạ Long + Trekking Tour Sapa")
                    .price(2_800_000.0)
                    .active(true)
                    .build();

            Combo natureCombo = Combo.builder()
                    .name("Nature Retreat Pack")
                    .description("Combo thiên nhiên: Camping hồ Ba Bể + Glamping núi Bà Nà + Buffet nướng Đà Lạt")
                    .price(2_500_000.0)
                    .active(true)
                    .build();

            Combo beachCombo = Combo.builder()
                    .name("Beach Getaway Pack")
                    .description("Combo biển: Glamping biển Phú Quốc + Buffet hải sản Nha Trang + Camping đồi cát Mũi Né")
                    .price(3_200_000.0)
                    .active(true)
                    .build();

            Combo mountainCombo = Combo.builder()
                    .name("Mountain Escape Pack")
                    .description("Combo núi: Glamping đồng cỏ Cát Tiên + Tour leo núi Fansipan + Camping rừng thông Đà Lạt")
                    .price(2_700_000.0)
                    .active(true)
                    .build();

            Combo riverCombo = Combo.builder()
                    .name("River Adventure Pack")
                    .description("Combo sông nước: Tour chèo thuyền Cửu Chân + Camping hồ Ba Bể + Buffet BBQ ngoài trời")
                    .price(1_800_000.0)
                    .active(true)
                    .build();
            // --- 5. Tạo ComboItem ---
            ComboItem item1 = ComboItem.builder().combo(familyCombo).service(s1).quantity(1).build();
            ComboItem item2 = ComboItem.builder().combo(familyCombo).service(s2).quantity(1).build();
            ComboItem item3 = ComboItem.builder().combo(familyCombo).service(s3).quantity(4).build(); // cho 4 người
            ComboItem item4 = ComboItem.builder().combo(familyCombo).service(s4).quantity(4).build(); // cho 4 người

            familyCombo.setItems(List.of(item1, item2, item3, item4));

            ComboItem item5 = ComboItem.builder().combo(adventureCombo).service(s5).quantity(1).build();
<<<<<<< HEAD
            ComboItem item6 = ComboItem.builder().combo(adventureCombo).service(s8).quantity(4).build(); // cho 4 người
            ComboItem item7 = ComboItem.builder().combo(adventureCombo).service(s4).quantity(4).build(); // cho 4 người
            adventureCombo.setItems(List.of(item5, item6, item7));

            ComboItem item8 = ComboItem.builder().combo(natureCombo).service(s10).quantity(1).build();
            ComboItem item9 = ComboItem.builder().combo(natureCombo).service(s9).quantity(1).build();
            ComboItem item10 = ComboItem.builder().combo(natureCombo).service(s11).quantity(4).build(); // cho 4 người
            natureCombo.setItems(List.of(item8, item9, item10));

            ComboItem item11 = ComboItem.builder().combo(beachCombo).service(s5).quantity(1).build();
            ComboItem item12 = ComboItem.builder().combo(beachCombo).service(s7).quantity(4).build(); // cho 4 người
            ComboItem item13 = ComboItem.builder().combo(beachCombo).service(s6).quantity(1).build();
            beachCombo.setItems(List.of(item11, item12, item13));

            ComboItem item14 = ComboItem.builder().combo(mountainCombo).service(s13).quantity(1).build();
            ComboItem item15 = ComboItem.builder().combo(mountainCombo).service(s12).quantity(4).build(); // cho 4 người
=======
            ComboItem item6 = ComboItem.builder().combo(adventureCombo).service(s1).quantity(4).build(); // cho 4 người
            ComboItem item7 = ComboItem.builder().combo(adventureCombo).service(s4).quantity(4).build(); // cho 4 người
            adventureCombo.setItems(List.of(item5, item6, item7));

            ComboItem item8 = ComboItem.builder().combo(natureCombo).service(s3).quantity(1).build();
            ComboItem item9 = ComboItem.builder().combo(natureCombo).service(s3).quantity(1).build();
            ComboItem item10 = ComboItem.builder().combo(natureCombo).service(s5).quantity(4).build(); // cho 4 người
            natureCombo.setItems(List.of(item8, item9, item10));

            ComboItem item11 = ComboItem.builder().combo(beachCombo).service(s5).quantity(1).build();
            ComboItem item12 = ComboItem.builder().combo(beachCombo).service(s4).quantity(4).build(); // cho 4 người
            ComboItem item13 = ComboItem.builder().combo(beachCombo).service(s6).quantity(1).build();
            beachCombo.setItems(List.of(item11, item12, item13));

            ComboItem item14 = ComboItem.builder().combo(mountainCombo).service(s2).quantity(1).build();
            ComboItem item15 = ComboItem.builder().combo(mountainCombo).service(s4).quantity(4).build(); // cho 4 người
>>>>>>> 4b112d9 (Add or update frontend & backend code)
            ComboItem item16 = ComboItem.builder().combo(mountainCombo).service(s2).quantity(1).build();
            mountainCombo.setItems(List.of(item14, item15, item16));

            ComboItem item17 = ComboItem.builder().combo(riverCombo).service(s14).quantity(4).build(); // cho 4 người
<<<<<<< HEAD
            ComboItem item18 = ComboItem.builder().combo(riverCombo).service(s10).quantity(1).build();
=======
            ComboItem item18 = ComboItem.builder().combo(riverCombo).service(s6).quantity(1).build();
>>>>>>> 4b112d9 (Add or update frontend & backend code)
            ComboItem item19 = ComboItem.builder().combo(riverCombo).service(s3).quantity(4).build(); // cho 4 người
            riverCombo.setItems(List.of(item17, item18, item19));

            // --- 6. Lưu Combo + ComboItem ---
            comboRepo.save(familyCombo);
            comboRepo.save(adventureCombo);
            comboRepo.save(natureCombo);
            comboRepo.save(beachCombo);
            comboRepo.save(mountainCombo);
            comboRepo.save(riverCombo);

            System.out.println("DataLoader: Customers, Services, Bookings, Combos đã được seed thành công!");
        };
    }
}

