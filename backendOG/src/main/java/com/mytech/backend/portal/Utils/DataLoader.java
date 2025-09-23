package com.mytech.backend.portal.Utils;

import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingItem;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Booking.ItemType;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Combo.ComboItem;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Review.Review;
import com.mytech.backend.portal.models.Review.ReviewStatus;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.models.Service.ServiceAvailability;
import com.mytech.backend.portal.models.Service.ServiceTag;
import com.mytech.backend.portal.models.User.User;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.ComboRepository;
import com.mytech.backend.portal.repositories.CustomerRepository;
import com.mytech.backend.portal.repositories.ReviewRepository;
import com.mytech.backend.portal.repositories.ServiceAvailabilityRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

    // -----------------------
    // Các repository được inject
    // -----------------------
    private final UserRepository userRepository;
    private final CustomerRepository customerRepo;
    private final ServiceRepository serviceRepo;
    private final ServiceAvailabilityRepository serviceAvailabilityRepository;
    private final BookingRepository bookingRepo;
    private final ComboRepository comboRepo;
    private final ReviewRepository reviewRepository;

    // Mã hóa mật khẩu (nên inject như Bean nếu muốn)
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // -----------------------
    // Điểm vào: bean seed
    // -----------------------
    @Bean
    CommandLineRunner seed() {
        return args -> {
            // Phòng ngừa: nếu đã có dữ liệu thì bỏ qua việc seed
            if (serviceRepo.count() > 0 || customerRepo.count() > 0 || comboRepo.count() > 0) {
                System.out.println("DataLoader: đã tìm thấy dữ liệu — bỏ qua seed.");
                return;
            }

            // 1) Tạo users + customers
            Customer[] createdCustomers = seedUsers();

            // 2) Tạo services + availability
            List<Service> services = seedServices();
            seedServiceAvailability(services);

            // 3) Tạo bookings (trả về danh sách booking để liên kết review)
            List<Booking> createdBookings = seedBookings(createdCustomers);

            // 3b) Tạo thêm 3 customer + mỗi customer 3 booking (PENDING, CONFIRMED, COMPLETED)
            //      Các booking COMPLETED có checkout cách hiện tại 1-6 ngày (ở đây dùng 1,3,5)
            seedCustomersWithBookings(services);

            // 4) Tạo reviews liên kết với bookings (nếu có)
            seedReviews(createdBookings);

            // 5) Tạo combos
            seedCombos(services);

            System.out.println("DataLoader: Customers, Services, Bookings, Reviews, Combos đã được seed thành công!");
        };
    }

    // ---------------------------
    // Helper: tạo user + customer
    // ---------------------------
    private Customer createUserWithCustomer(
            String name,
            String email,
            String rawPassword,
            String phone,
            User.Role role,
            User.Status status,
            String firstName,
            String lastName,
            String address
    ) {
        User u = User.builder()
                .name(name)
                .email(email)
                .password(rawPassword != null ? passwordEncoder.encode(rawPassword) : null)
                .phone(phone)
                .role(role)
                .status(status)
                .build();

        u = userRepository.save(u);

        Customer c = Customer.builder()
                .firstName(firstName)
                .lastName(lastName)
                .name(name)
                .email(email)
                .phone(phone)
                .address(address)
                .user(u)
                .build();

        customerRepo.save(c);
        return c;
    }

    private Customer[] seedUsers() {
        // Admin
        Customer c1 = createUserWithCustomer(
                "ADMIN", "admin@gmail.com", "123456", "0909123456",
                User.Role.ADMIN, User.Status.ACTIVE, "ADMIN", "MANAGER", "Ha Noi"
        );

        // Ví dụ staff
        Customer c2 = createUserWithCustomer(
                "Tran Binh", "staff@gmail.com", "123456", "0909988776",
                User.Role.STAFF, User.Status.ACTIVE, "Tran", "Binh", "Da Nang"
        );

        Customer c5 = createUserWithCustomer(
                "Hoai Tam", "staff1@gmail.com", "123456", "0909988244",
                User.Role.STAFF, User.Status.ACTIVE, "Hoai", "Tam", "Da Nang"
        );

        Customer c6 = createUserWithCustomer(
                "Lê Văn Cường", "staff2@gmail.com", "123456", "0909988241",
                User.Role.STAFF, User.Status.ACTIVE, "LE", "CUONG", "Da Nang"
        );

        // Khách hàng
        Customer c3 = createUserWithCustomer(
                "Le Cuong", "cuong@example.com", "123456", "0912345678",
                User.Role.CUSTOMER, User.Status.ACTIVE, "Le", "Cuong", "Ho Chi Minh"
        );

        Customer c4 = createUserWithCustomer(
                "Pham Dung", "dung@example.com", "123456", "0933445566",
                User.Role.CUSTOMER, User.Status.ACTIVE, "Pham", "Dung", "Hai Phong"
        );

        return new Customer[]{c1, c2, c3, c4, c5, c6};
    }

    // ---------------------------
    // Helpers: tạo services
    // ---------------------------
    private List<Service> seedServices() {
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
                .extraFeePerPerson(200_000.0)
                .maxExtraPeople(3)
                .imageUrl("/uploads/services/camping-song.jpg")
                .build());

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
                .extraFeePerPerson(200_000.0)
                .maxExtraPeople(3)
                .imageUrl("/uploads/services/glamping-rung.jpg")
                .build());

        Service s3 = serviceRepo.save(Service.builder()
                .name("Camping BBQ đêm ven sông")
                .description("Cắm trại và thưởng thức BBQ buổi tối với bạn bè bên bờ sông, lửa trại và âm nhạc.")
                .price(950_000.0)
                .location("Củ Chi, TP.HCM")
                .minDays(1).maxDays(2)
                .minCapacity(4).maxCapacity(8)
                .tag(ServiceTag.POPULAR)
                .allowExtraPeople(true)
                .extraFeePerPerson(200_000.0)
                .maxExtraPeople(3)
                .active(true)
                .imageUrl("/uploads/services/camping-bbq.jpg")
                .build());

        Service s4 = serviceRepo.save(Service.builder()
                .name("Glamping lãng mạn cho cặp đôi")
                .description("Không gian riêng tư, lều glamping sang trọng với trang trí lãng mạn, phù hợp cho couple.")
                .price(2_200_000.0)
                .location("Củ Chi, TP.HCM")
                .minDays(1).maxDays(2)
                .minCapacity(2).maxCapacity(2)
                .tag(ServiceTag.DISCOUNT)
                .allowExtraPeople(true)
                .extraFeePerPerson(200_000.0)
                .maxExtraPeople(3)
                .active(true)
                .imageUrl("/uploads/services/glamping-couple.jpg")
                .build());

        Service s5 = serviceRepo.save(Service.builder()
                .name("Camping gia đình cuối tuần")
                .description("Không gian an toàn, thích hợp cho gia đình có trẻ nhỏ, nhiều hoạt động vui chơi ngoài trời.")
                .price(1_100_000.0)
                .location("Củ Chi, TP.HCM")
                .minDays(2).maxDays(3)
                .minCapacity(4).maxCapacity(10)
                .tag(ServiceTag.POPULAR)
                .allowExtraPeople(true)
                .extraFeePerPerson(200_000.0)
                .maxExtraPeople(3)
                .active(true)
                .imageUrl("/uploads/services/camping-family.jpg")
                .build());

        Service s6 = serviceRepo.save(Service.builder()
                .name("Glamping hồ bơi ngoài trời")
                .description("Lều glamping cạnh hồ bơi, không gian sang trọng với tiện ích cao cấp.")
                .price(2_500_000.0)
                .location("Củ Chi, TP.HCM")
                .minDays(1).maxDays(3)
                .minCapacity(2).maxCapacity(5)
                .tag(ServiceTag.NEW)
                .allowExtraPeople(true)
                .extraFeePerPerson(200_000.0)
                .maxExtraPeople(3)
                .active(true)
                .imageUrl("/uploads/services/glamping-hoboi.jpg")
                .build());

        Service s14 = serviceRepo.save(Service.builder()
                .name("Tour chèo thuyền Cửu Chân")
                .description("Khám phá sông nước Cửu Chân bằng thuyền")
                .price(350_000.0)
                .location("Thanh Hóa")
                .active(true)
                .allowExtraPeople(true)
                .extraFeePerPerson(200_000.0)
                .maxExtraPeople(3)
                .imageUrl("/uploads/services/thuyen.jpg")
                .build());

        return List.of(s1, s2, s3, s4, s5, s6, s14);
    }

    private void seedServiceAvailability(List<Service> services) {
        LocalDate today = LocalDate.now();
        for (Service s : services) {
            // tạo availability cho 3 ngày tới, mỗi ngày 5 slot
            for (int i = 0; i < 3; i++) {
                serviceAvailabilityRepository.save(ServiceAvailability.builder()
                        .service(s)
                        .date(today.plusDays(i))
                        .totalSlots(5)
                        .bookedSlots(0)
                        .build());
            }
        }
    }

    // ---------------------------
    // Helpers: tạo bookings
    // Trả về danh sách booking đã tạo để dùng liên kết review
    // ---------------------------
    private List<Booking> seedBookings(Customer[] createdCustomers) {
        List<Booking> created = new ArrayList<>();

        // Sử dụng khách đã tạo theo chỉ số
        Customer c1 = createdCustomers[0]; // admin
        Customer c2 = createdCustomers[1]; // ví dụ staff

        // booking dự kiến (tương lai)
        Booking booking1 = Booking.builder()
                .customer(c1)
                .checkInDate(LocalDateTime.now().plusDays(5))
                .checkOutDate(LocalDateTime.now().plusDays(7))
                .numberOfPeople(2)
                .note("Kỷ niệm")
                .status(BookingStatus.PENDING)
                .build();

        // booking đã hoàn thành (quá khứ)
        Booking booking2 = Booking.builder()
                .customer(c2)
                .checkInDate(LocalDateTime.now().minusDays(2))
                .checkOutDate(LocalDateTime.now().minusDays(1))
                .numberOfPeople(2)
                .note("1 ngày")
                .status(BookingStatus.COMPLETED)
                .build();

        // gán booking items (lấy service đầu tiên làm ví dụ)
        Service serviceExample = serviceRepo.findAll().stream().findFirst().orElse(null);
        if (serviceExample != null) {
            BookingItem item1 = BookingItem.builder()
                    .booking(booking1)
                    .service(serviceExample)
                    .type(ItemType.SERVICE)
                    .quantity(1)
                    .price(serviceExample.getPrice())
                    .build();

            BookingItem item2 = BookingItem.builder()
                    .booking(booking2)
                    .service(serviceExample)
                    .type(ItemType.SERVICE)
                    .quantity(1)
                    .price(serviceExample.getPrice())
                    .build();

            booking1.setItems(List.of(item1));
            booking2.setItems(List.of(item2));
        }

        bookingRepo.save(booking1);
        bookingRepo.save(booking2);

        created.add(booking1);
        created.add(booking2);
        return created;
    }

    // ---------------------------
    // Helpers: tạo thêm 3 customer + mỗi customer 3 booking (PENDING, CONFIRMED, COMPLETED)
    // Các booking COMPLETED có checkout cách hiện tại 1,3,5 ngày (thuộc khoảng 1..6)
    // ---------------------------
    private void seedCustomersWithBookings(List<Service> services) {
        if (services == null || services.isEmpty()) return;

        // Tạo 3 customer mới
        Customer a = createUserWithCustomer(
                "Nguyen Van A", "a@example.com", "123456", "0901111111",
                User.Role.CUSTOMER, User.Status.ACTIVE, "Nguyen", "Van A", "Ha Noi"
        );

        Customer b = createUserWithCustomer(
                "Nguyen Van B", "b@example.com", "123456", "0902222222",
                User.Role.CUSTOMER, User.Status.ACTIVE, "Nguyen", "Van B", "Da Nang"
        );

        Customer c = createUserWithCustomer(
                "Nguyen Van C", "c@example.com", "123456", "0903333333",
                User.Role.CUSTOMER, User.Status.ACTIVE, "Nguyen", "Van C", "Ho Chi Minh"
        );

        List<Customer> newCustomers = List.of(a, b, c);

        // offsets cho checkout của booking COMPLETED: 1, 3, 5 ngày trước
        int[] completedOffsets = new int[]{1, 3, 5};

        // Tạo bookings cho từng customer
        for (int i = 0; i < newCustomers.size(); i++) {
            Customer cust = newCustomers.get(i);

            // chọn 3 service khác nhau (phòng ngừa thiếu)
            Service svc1 = services.get( (i*0) % services.size() );
            Service svc2 = services.get( (i*1 + 1) % services.size() );
            Service svc3 = services.get( (i*2 + 2) % services.size() );

            // 1) PENDING (tương lai)
            Booking pending = Booking.builder()
                    .customer(cust)
                    .checkInDate(LocalDateTime.now().plusDays(7))
                    .checkOutDate(LocalDateTime.now().plusDays(8))
                    .numberOfPeople(2)
                    .note("Booking PENDING demo")
                    .status(BookingStatus.PENDING)
                    .build();

            BookingItem pItem = BookingItem.builder()
                    .booking(pending)
                    .service(svc1)
                    .type(ItemType.SERVICE)
                    .quantity(1)
                    .price(svc1.getPrice())
                    .build();
            pending.setItems(List.of(pItem));
            bookingRepo.save(pending);

            // 2) CONFIRMED (sắp tới, đã xác nhận)
            Booking confirmed = Booking.builder()
                    .customer(cust)
                    .checkInDate(LocalDateTime.now().plusDays(3))
                    .checkOutDate(LocalDateTime.now().plusDays(4))
                    .numberOfPeople(3)
                    .note("Booking CONFIRMED demo")
                    .status(BookingStatus.CONFIRMED)
                    .build();

            BookingItem cItem = BookingItem.builder()
                    .booking(confirmed)
                    .service(svc2)
                    .type(ItemType.SERVICE)
                    .quantity(1)
                    .price(svc2.getPrice())
                    .build();
            confirmed.setItems(List.of(cItem));
            bookingRepo.save(confirmed);

            // 3) COMPLETED (quá khứ) — checkout cách hiện tại 1..6 ngày (ở đây dùng completedOffsets)
            int offsetDays = completedOffsets[i % completedOffsets.length]; // 1,3,5
            Booking completed = Booking.builder()
                    .customer(cust)
                    .checkInDate(LocalDateTime.now().minusDays(offsetDays + 1))
                    .checkOutDate(LocalDateTime.now().minusDays(offsetDays))
                    .numberOfPeople(2)
                    .note("Booking COMPLETED demo")
                    .status(BookingStatus.COMPLETED)
                    .build();

            BookingItem compItem = BookingItem.builder()
                    .booking(completed)
                    .service(svc3)
                    .type(ItemType.SERVICE)
                    .quantity(1)
                    .price(svc3.getPrice())
                    .build();
            completed.setItems(List.of(compItem));
            // ensure hasReview default = false
            completed.setHasReview(false);

            bookingRepo.save(completed);
        }
    }

    // ---------------------------
    // Helpers: tạo reviews liên kết với bookings
    // Mỗi review sẽ:
    //   - liên kết với booking
    //   - đánh dấu booking.hasReview = true
    //   - cập nhật tổng review và điểm trung bình cho service tương ứng
    // ---------------------------
    private void seedReviews(List<Booking> bookings) {
        if (bookings == null || bookings.isEmpty()) return;

        // Tìm 1 booking đã hoàn thành (ở seedBookings chúng ta có 1 booking completed)
        Booking completedBooking = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .findFirst()
                .orElse(null);

        if (completedBooking == null) return;

        // Lấy service từ booking item (phòng ngừa null)
        Service service = null;
        if (completedBooking.getItems() != null && !completedBooking.getItems().isEmpty()) {
            service = completedBooking.getItems().get(0).getService();
        }

        if (service == null) return;

        // Khách hàng từ booking
        Customer customer = completedBooking.getCustomer();

        // Tạo review mẫu
        Review review = Review.builder()
                .customer(customer)
                .service(service)
                .booking(completedBooking)
                .rating(4) // điểm đánh giá
                .content("Trải nghiệm tốt, nhân viên thân thiện, đồ ăn ổn.")
                .images(List.of("/uploads/reviews/images/sample_review_img1.jpg"))
                .videos(List.of("/uploads/reviews/videos/sample_review_vid1.mp4"))
                .reply("Cảm ơn bạn đã đánh giá!") // tuỳ chọn
                .status(ReviewStatus.APPROVED) // APPROVED để FE hiển thị
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        // lưu review
        reviewRepository.save(review);

        // đánh dấu booking đã được review
        completedBooking.setHasReview(true);
        bookingRepo.save(completedBooking);

        // cập nhật tổng reviews & điểm trung bình cho service
        int prevCount = service.getTotalReviews() != null ? service.getTotalReviews() : 0;
        double prevAvg = service.getAverageRating() != null ? service.getAverageRating() : 0.0;
        int newCount = prevCount + 1;
        double newAvg = ((prevAvg * prevCount) + review.getRating()) / newCount;
        service.setTotalReviews(newCount);
        service.setAverageRating(newAvg);
        serviceRepo.save(service);
    }

    // ---------------------------
    // Helpers: tạo combos
    // ---------------------------
    private void seedCombos(List<Service> services) {
        // combo gia đình
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

        // gán items vào combo (phòng ngừa: kiểm tra kích thước services)
        if (!services.isEmpty()) {
            Service s1 = services.get(0);
            Service s2 = services.size() > 1 ? services.get(1) : s1;
            Service s3 = services.size() > 2 ? services.get(2) : s1;
            Service s4 = services.size() > 3 ? services.get(3) : s1;
            Service s5 = services.size() > 4 ? services.get(4) : s1;
            Service s6 = services.size() > 5 ? services.get(5) : s1;
            Service s14 = services.size() > 6 ? services.get(6) : s1;

            familyCombo.setItems(List.of(
                    ComboItem.builder().combo(familyCombo).service(s1).quantity(1).build(),
                    ComboItem.builder().combo(familyCombo).service(s2).quantity(1).build(),
                    ComboItem.builder().combo(familyCombo).service(s3).quantity(4).build(),
                    ComboItem.builder().combo(familyCombo).service(s4).quantity(4).build()
            ));

            adventureCombo.setItems(List.of(
                    ComboItem.builder().combo(adventureCombo).service(s5).quantity(1).build(),
                    ComboItem.builder().combo(adventureCombo).service(s1).quantity(4).build(),
                    ComboItem.builder().combo(adventureCombo).service(s4).quantity(4).build()
            ));

            natureCombo.setItems(List.of(
                    ComboItem.builder().combo(natureCombo).service(s3).quantity(1).build(),
                    ComboItem.builder().combo(natureCombo).service(s3).quantity(1).build(),
                    ComboItem.builder().combo(natureCombo).service(s5).quantity(4).build()
            ));

            teamBuildingCombo.setItems(List.of(
                    ComboItem.builder().combo(teamBuildingCombo).service(s5).quantity(1).build(),
                    ComboItem.builder().combo(teamBuildingCombo).service(s4).quantity(4).build(),
                    ComboItem.builder().combo(teamBuildingCombo).service(s6).quantity(1).build()
            ));

            weekendEscapeCombo.setItems(List.of(
                    ComboItem.builder().combo(weekendEscapeCombo).service(s2).quantity(1).build(),
                    ComboItem.builder().combo(weekendEscapeCombo).service(s4).quantity(4).build(),
                    ComboItem.builder().combo(weekendEscapeCombo).service(s2).quantity(1).build()
            ));

            riverAdventureCombo.setItems(List.of(
                    ComboItem.builder().combo(riverAdventureCombo).service(s14).quantity(4).build(),
                    ComboItem.builder().combo(riverAdventureCombo).service(s6).quantity(1).build(),
                    ComboItem.builder().combo(riverAdventureCombo).service(s3).quantity(4).build()
            ));
        }

        // Lưu combos
        comboRepo.save(familyCombo);
        comboRepo.save(adventureCombo);
        comboRepo.save(natureCombo);
        comboRepo.save(teamBuildingCombo);
        comboRepo.save(weekendEscapeCombo);
        comboRepo.save(riverAdventureCombo);
    }
}
