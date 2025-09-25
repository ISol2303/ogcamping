package com.mytech.backend.portal.Utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.mytech.backend.portal.models.Area;
import com.mytech.backend.portal.models.Category;
import com.mytech.backend.portal.models.Gear;
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
import com.mytech.backend.portal.models.UserProvider.UserProvider;
import com.mytech.backend.portal.repositories.AreaRepository;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.CategoryRepository;
import com.mytech.backend.portal.repositories.ComboRepository;
import com.mytech.backend.portal.repositories.CustomerRepository;
import com.mytech.backend.portal.repositories.GearRepository;
import com.mytech.backend.portal.repositories.ReviewRepository;
import com.mytech.backend.portal.repositories.ServiceAvailabilityRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class SeedService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepo;
    private final ServiceRepository serviceRepo;
    private final ServiceAvailabilityRepository serviceAvailabilityRepository;
    private final BookingRepository bookingRepo;
    private final ComboRepository comboRepo;
    private final ReviewRepository reviewRepository;
    private final AreaRepository areaRepository;
    private final CategoryRepository categoryRepository;
    private final GearRepository gearRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Public transactional entry-point for seeding.
     * This method runs inside a Spring transaction/proxy so lazy collections work.
     */
    @Transactional
    public void runSeed() {
        // Phòng ngừa: nếu đã có dữ liệu thì bỏ qua việc seed
        if (serviceRepo.count() > 0 || customerRepo.count() > 0 || comboRepo.count() > 0 ||
                areaRepository.count() > 0 || categoryRepository.count() > 0 || gearRepository.count() > 0) {
            System.out.println("SeedService: đã tìm thấy dữ liệu — bỏ qua seed.");
            return;
        }

        // 1) Tạo users + customers
        Customer[] createdCustomers = seedUsers();

        // 2) Tạo services + availability
        List<Service> services = seedServices();
        seedServiceAvailability(services);

        // 3) Tạo bookings (trả về danh sách booking để liên kết review)
        List<Booking> createdBookings = seedBookings(createdCustomers);

        // 3b) Tạo thêm 3 customer + mỗi customer 3 booking ... (có 2 completed)
        seedCustomersWithBookings(services);

        // Tạo 9 review thực tế cho service id 1 & 2 (gắn vào booking nếu có, nếu không tạo fake completed booking)
        seedAdditionalReviewsForServiceIds();

        // 4) Tạo review mẫu liên kết với createdBookings nếu cần
        seedReviews(createdBookings);

        // 5) Tạo combos
        seedCombos(services);

        // 6) Tạo areas
        List<Area> areas = seedAreas();

        // 7) Tạo categories
        List<Category> categories = seedCategories();

        // 8) Tạo gears
        seedGears(areas, categories);

        System.out.println("SeedService: Seed hoàn tất!");
    }

    // ---------------------------
    // Các helper methods (giữ nguyên logic từ file cũ, bọc trong cùng class)
    // ---------------------------

    private List<Area> seedAreas() {
        Area a1 = Area.builder()
                .name(Area.AreaName.TRONG_LEU)
                .description("Khu vực trong lều, dành cho các thiết bị sử dụng bên trong lều cắm trại.")
                .build();

        Area a2 = Area.builder()
                .name(Area.AreaName.NGOAI_LEU)
                .description("Khu vực ngoài lều, dành cho các thiết bị sử dụng ngoài trời.")
                .build();

        Area a3 = Area.builder()
                .name(Area.AreaName.BEP)
                .description("Khu vực bếp, dành cho các thiết bị nấu nướng và BBQ.")
                .build();

        areaRepository.saveAll(List.of(a1, a2, a3));
        return List.of(a1, a2, a3);
    }

    private void seedGears(List<Area> areas, List<Category> categories) {
        if (areas.isEmpty() || categories.isEmpty()) return;

        Gear g1 = Gear.builder()
                .name("Lều cắm trại 4 người")
                .category(categories.get(0).getName())
                .area(areas.get(0).getName())
                .description("Lều 4 người, chống nước, dễ lắp ráp.")
                .quantityInStock(10)
                .pricePerDay(150_000.0)
                .image("/uploads/gears/tent_4p.jpg")
                .available(8)
                .total(10)
                .status(Gear.GearStatus.AVAILABLE)
                .build();

        Gear g2 = Gear.builder()
                .name("Bếp gas mini")
                .category(categories.get(1).getName())
                .area(areas.get(2).getName())
                .description("Bếp gas mini tiện lợi, phù hợp cho cắm trại.")
                .quantityInStock(5)
                .pricePerDay(50_000.0)
                .image("/uploads/gears/gas_stove.jpg")
                .available(3)
                .total(5)
                .status(Gear.GearStatus.AVAILABLE)
                .build();

        Gear g3 = Gear.builder()
                .name("Ghế gấp cắm trại")
                .category(categories.get(2).getName())
                .area(areas.get(1).getName())
                .description("Ghế gấp nhẹ, dễ mang theo, chịu tải đến 100kg.")
                .quantityInStock(20)
                .pricePerDay(30_000.0)
                .image("/uploads/gears/camping_chair.jpg")
                .available(15)
                .total(20)
                .status(Gear.GearStatus.AVAILABLE)
                .build();

        Gear g4 = Gear.builder()
                .name("Dây thừng đa năng")
                .category(categories.get(3).getName())
                .area(areas.get(1).getName())
                .description("Dây thừng dài 10m, chịu lực tốt, đa năng.")
                .quantityInStock(0)
                .pricePerDay(20_000.0)
                .image("/uploads/gears/rope.jpg")
                .available(0)
                .total(0)
                .status(Gear.GearStatus.OUT_OF_STOCK)
                .build();

        Gear g5 = Gear.builder()
                .name("Đèn pin cắm trại")
                .category(categories.get(2).getName())
                .area(areas.get(0).getName())
                .description("Đèn pin LED siêu sáng, pin sạc USB.")
                .quantityInStock(8)
                .pricePerDay(40_000.0)
                .image("/uploads/gears/flashlight.jpg")
                .available(6)
                .total(8)
                .status(Gear.GearStatus.AVAILABLE)
                .build();

        gearRepository.saveAll(List.of(g1, g2, g3, g4, g5));
    }

    private List<Category> seedCategories() {
        Category c1 = Category.builder()
                .name("Lều")
                .description("Các loại lều cắm trại, từ lều đơn đến lều gia đình.")
                .build();

        Category c2 = Category.builder()
                .name("Bếp")
                .description("Thiết bị nấu nướng, bếp gas, bếp than và phụ kiện liên quan.")
                .build();

        Category c3 = Category.builder()
                .name("Đồ dùng cắm trại")
                .description("Các vật dụng hỗ trợ cắm trại như ghế, bàn, đèn...")
                .build();

        Category c4 = Category.builder()
                .name("Phụ kiện")
                .description("Các phụ kiện nhỏ như dây thừng, dao, bình nước...")
                .build();

        categoryRepository.saveAll(List.of(c1, c2, c3, c4));
        return List.of(c1, c2, c3, c4);
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
        // Tạo user object (chưa save)
        User u = User.builder()
                .name(name)
                .email(email)
                .password(rawPassword != null ? passwordEncoder.encode(rawPassword) : null)
                .phone(phone)
                .role(role)
                .status(status)
                .build();

        // Đảm bảo providerId cho LOCAL không null:
        String localProviderId = (email != null && !email.isBlank())
                ? email
                : "local-" + System.currentTimeMillis();

        // Tạo và gắn LOCAL provider ngay trước khi save
        UserProvider localProvider = UserProvider.of(u, UserProvider.Provider.LOCAL, localProviderId);
        if (u.getProviders() == null) {
            u.setProviders(new HashSet<>());
        }
        u.getProviders().add(localProvider);

        // Lưu user (sẽ persist luôn user_providers do Cascade.ALL)
        u = userRepository.save(u);

        // Tạo và lưu Customer liên quan
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
        Customer c1 = createUserWithCustomer(
                "ADMIN", "admin@gmail.com", "123456", "0909123456",
                User.Role.ADMIN, User.Status.ACTIVE, "ADMIN", "MANAGER", "Ha Noi"
        );

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
                .location("Củ chi")
                .active(true)
                .minDays(1).maxDays(1)
                .minCapacity(1).maxCapacity(1)
                .allowExtraPeople(true)
                .extraFeePerPerson(200_000.0)
                .maxExtraPeople(0)
                .imageUrl("/uploads/services/thuyen.jpg")
                .build());

        return List.of(s1, s2, s3, s4, s5, s6, s14);
    }

    private void seedServiceAvailability(List<Service> services) {
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
    }

    private List<Booking> seedBookings(Customer[] createdCustomers) {
        List<Booking> created = new ArrayList<>();

        // Chọn 2 customer có role = CUSTOMER từ mảng createdCustomers
        Customer c1 = null;
        Customer c2 = null;
        for (Customer c : createdCustomers) {
            if (c != null && c.getUser() != null && c.getUser().getRole() == User.Role.CUSTOMER) {
                if (c1 == null) c1 = c;
                else if (c2 == null) { c2 = c; break; }
            }
        }
        // Fallback nếu không tìm đủ customer
        if (c1 == null) c1 = createdCustomers.length > 0 ? createdCustomers[0] : null;
        if (c2 == null) c2 = createdCustomers.length > 1 ? createdCustomers[1] : c1;

        if (c1 == null || c2 == null) return created;

        Booking booking1 = Booking.builder()
                .customer(c1)
                .checkInDate(LocalDateTime.now().plusDays(5))
                .checkOutDate(LocalDateTime.now().plusDays(7))
                .numberOfPeople(2)
                .note("Kỷ niệm")
                .status(BookingStatus.PENDING)
                .build();

        Booking booking2 = Booking.builder()
                .customer(c2)
                .checkInDate(LocalDateTime.now().minusDays(2))
                .checkOutDate(LocalDateTime.now().minusDays(1))
                .numberOfPeople(2)
                .note("1 ngày")
                .status(BookingStatus.COMPLETED)
                .build();

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

            booking1.setItems(new ArrayList<>(List.of(item1)));
            booking2.setItems(new ArrayList<>(List.of(item2)));
        }

        bookingRepo.save(booking1);
        bookingRepo.save(booking2);

        created.add(booking1);
        created.add(booking2);
        return created;
    }


    private void seedCustomersWithBookings(List<Service> services) {
        if (services == null || services.isEmpty()) return;

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

        int[] completedOffsets = new int[]{2,3,4,5,6,7};

        for (int i = 0; i < newCustomers.size(); i++) {
            Customer cust = newCustomers.get(i);

            Service svc1 = services.get((i*0) % services.size());
            Service svc2 = services.get((i*1 + 1) % services.size());
            Service svc3 = services.get((i*2 + 2) % services.size());

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
            pending.setItems(new ArrayList<>(List.of(pItem)));
            bookingRepo.save(pending);

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
            confirmed.setItems(new ArrayList<>(List.of(cItem)));
            bookingRepo.save(confirmed);

            int offset1 = completedOffsets[(i*2) % completedOffsets.length];
            Booking completed1 = Booking.builder()
                    .customer(cust)
                    .checkInDate(LocalDateTime.now().minusDays(offset1 + 1))
                    .checkOutDate(LocalDateTime.now().minusDays(offset1))
                    .numberOfPeople(2)
                    .note("Booking COMPLETED demo #1")
                    .status(BookingStatus.COMPLETED)
                    .build();

            BookingItem compItem1 = BookingItem.builder()
                    .booking(completed1)
                    .service(svc3)
                    .type(ItemType.SERVICE)
                    .quantity(1)
                    .price(svc3.getPrice())
                    .build();
            completed1.setItems(new ArrayList<>(List.of(compItem1)));
            completed1.setHasReview(false);
            bookingRepo.save(completed1);

            int offset2 = completedOffsets[(i*2 + 1) % completedOffsets.length];
            Booking completed2 = Booking.builder()
                    .customer(cust)
                    .checkInDate(LocalDateTime.now().minusDays(offset2 + 1))
                    .checkOutDate(LocalDateTime.now().minusDays(offset2))
                    .numberOfPeople(2)
                    .note("Booking COMPLETED demo #2")
                    .status(BookingStatus.COMPLETED)
                    .build();

            BookingItem compItem2 = BookingItem.builder()
                    .booking(completed2)
                    .service(svc2)
                    .type(ItemType.SERVICE)
                    .quantity(1)
                    .price(svc2.getPrice())
                    .build();
            completed2.setItems(new ArrayList<>(List.of(compItem2)));
            completed2.setHasReview(false);
            bookingRepo.save(completed2);
        }
    }

    // Tạo 9 review thực tế cho service id = 1 và 2, mỗi review được gắn vào một booking COMPLETED (nếu không có thì tạo booking COMPLETED giả)
    private void seedAdditionalReviewsForServiceIds() {
        Service s1 = serviceRepo.findById(1L).orElse(null);
        Service s2 = serviceRepo.findById(2L).orElse(null);
        if (s1 == null && s2 == null) return;

        // Lọc chỉ những Customer whose User.Role == CUSTOMER
        List<Customer> customers = customerRepo.findAll()
                .stream()
                .filter(c -> c.getUser() != null && c.getUser().getRole() == User.Role.CUSTOMER)
                .collect(Collectors.toList());
        if (customers == null || customers.isEmpty()) return;

        String[] realisticReviews = new String[] {
            // ... (giữ nguyên mảng bình luận)
            "Không gian ven sông rất yên tĩnh, lều sạch, có chăn ấm. Nhân viên hướng dẫn nhiệt tình, bữa BBQ đơn giản nhưng ngon. Gia đình rất hài lòng, sẽ quay lại.",
            "Glamping tiện nghi, nệm êm, trang trí lãng mạn phù hợp cho cặp đôi. Chỉ tiếc là buổi tối hơi thiếu ánh sáng ở đường đi, nhưng tổng thể rất đáng đồng tiền.",
            "Vị trí đẹp, view sông rất chill. Nhà vệ sinh chung được giữ sạch, cần thêm vài ổ cắm điện ở khu chung. Thái độ nhân viên thân thiện, hỗ trợ nhanh.",
            "Chỗ ở sang, có điều hòa và giường êm. Thức ăn sáng hơi đơn giản, nhưng dịch vụ và không gian bù lại rất tốt. Rất thích hợp cho weekend nghỉ dưỡng.",
            "Lều khá tốt cho nhóm bạn, không gian rộng, có khu nướng BBQ sạch sẽ. Một vài dụng cụ như bếp gas hơi cũ, nhưng không ảnh hưởng nhiều.",
            "Không gian yên tĩnh, có cây xanh xung quanh. Giường và chăn sạch, buổi sáng nhiều chim hót — thư giãn tuyệt vời. Giá hơi cao nhưng dịch vụ xứng đáng.",
            "Trải nghiệm thực tế tốt, nhân viên nhiệt tình hỗ trợ dựng lều. Nếu mang theo trẻ nhỏ nên lưu ý khu vực bờ sông. Đã giới thiệu cho bạn bè.",
            "Glamping đẹp, trang trí tinh tế. Có chỗ chụp ảnh đẹp, phù hợp cho couples. Nên cải thiện wifi cho khách muốn làm việc từ xa.",
            "Buổi tối có lửa trại vui, đồ ăn ổn. Khuyến nghị mang theo thêm đồ cá nhân; nhìn chung là kỳ nghỉ ngắn đáng nhớ."
        };

        int totalReviews = realisticReviews.length;
        int[] offsets = new int[]{2,3,4,5,6,7};

        for (int i = 0; i < totalReviews; i++) {
            Service target = (i % 2 == 0 && s1 != null) ? s1 : (s2 != null ? s2 : s1);
            Customer customer = customers.get(i % customers.size());
            int offsetDays = offsets[i % offsets.length];

            List<String> images = List.of(
                    "/uploads/reviews/images/real_review_" + (i+1) + "_1.jpg",
                    "/uploads/reviews/images/real_review_" + (i+1) + "_2.jpg"
            );

            List<String> videos = List.of();
            if (i == 1 || i == 4 || i == 7) {
                videos = List.of("/uploads/reviews/videos/real_review_vid_" + (i+1) + ".mp4");
            }

            int rating;
            switch (i) {
                case 2: rating = 4; break;
                case 6: rating = 4; break;
                default: rating = 5;
            }

            // Tìm booking COMPLETED phù hợp có cùng customer và cùng service
            Booking matchedBooking = bookingRepo.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .filter(b -> b.getCustomer() != null && b.getCustomer().getId() != null && b.getCustomer().getId().equals(customer.getId()))
                .filter(b -> b.getItems() != null && b.getItems().stream()
                        .anyMatch(it -> it.getService() != null && it.getService().getId() != null && it.getService().getId().equals(target.getId()))
                )
                .findFirst()
                .orElse(null);

            if (matchedBooking == null) {
                Booking fakeCompleted = Booking.builder()
                        .customer(customer)
                        .checkInDate(LocalDateTime.now().minusDays(offsetDays + 1))
                        .checkOutDate(LocalDateTime.now().minusDays(offsetDays))
                        .numberOfPeople(2)
                        .note("Generated completed booking for seeding reviews")
                        .status(BookingStatus.COMPLETED)
                        .hasReview(false)
                        .build();

                BookingItem fakeItem = BookingItem.builder()
                        .booking(fakeCompleted)
                        .service(target)
                        .type(ItemType.SERVICE)
                        .quantity(1)
                        .price(target.getPrice())
                        .build();

                fakeCompleted.setItems(new ArrayList<>(List.of(fakeItem)));
                matchedBooking = bookingRepo.save(fakeCompleted);
            }

            Review r = Review.builder()
                    .customer(customer)
                    .service(target)
                    .booking(matchedBooking)
                    .rating(rating)
                    .content(realisticReviews[i])
                    .images(images)
                    .videos(videos)
                    .reply(null)
                    .status(ReviewStatus.APPROVED)
                    .createdAt(LocalDateTime.now().minusDays(offsetDays))
                    .build();

            reviewRepository.save(r);

            matchedBooking.setHasReview(true);
            bookingRepo.save(matchedBooking);

            int prevCount = target.getTotalReviews() != null ? target.getTotalReviews() : 0;
            double prevAvg = target.getAverageRating() != null ? target.getAverageRating() : 0.0;
            int newCount = prevCount + 1;
            double newAvg = ((prevAvg * prevCount) + r.getRating()) / newCount;
            target.setTotalReviews(newCount);
            target.setAverageRating(newAvg);
            serviceRepo.save(target);
        }
    }


    private void seedReviews(List<Booking> bookings) {
        if (bookings == null || bookings.isEmpty()) return;

        // Tìm completed booking mà booking.customer.user.role == CUSTOMER
        Booking completedBooking = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .filter(b -> b.getCustomer() != null && b.getCustomer().getUser() != null
                        && b.getCustomer().getUser().getRole() == User.Role.CUSTOMER)
                .findFirst()
                .orElse(null);

        // Nếu không tìm được, tìm ở DB
        if (completedBooking == null) {
            completedBooking = bookingRepo.findAll().stream()
                    .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                    .filter(b -> b.getCustomer() != null && b.getCustomer().getUser() != null
                            && b.getCustomer().getUser().getRole() == User.Role.CUSTOMER)
                    .findFirst()
                    .orElse(null);
        }

        // Nếu vẫn không có, tạo fake completed booking bằng 1 customer có role CUSTOMER
        if (completedBooking == null) {
            Customer anyCustomer = customerRepo.findAll().stream()
                    .filter(c -> c.getUser() != null && c.getUser().getRole() == User.Role.CUSTOMER)
                    .findFirst().orElse(null);
            if (anyCustomer == null) return;

            Service anyService = serviceRepo.findAll().stream().findFirst().orElse(null);
            if (anyService == null) return;

            Booking fake = Booking.builder()
                    .customer(anyCustomer)
                    .checkInDate(LocalDateTime.now().minusDays(3))
                    .checkOutDate(LocalDateTime.now().minusDays(2))
                    .numberOfPeople(2)
                    .note("Generated completed booking for seedReviews")
                    .status(BookingStatus.COMPLETED)
                    .hasReview(false)
                    .build();

            BookingItem item = BookingItem.builder()
                    .booking(fake)
                    .service(anyService)
                    .type(ItemType.SERVICE)
                    .quantity(1)
                    .price(anyService.getPrice())
                    .build();
            fake.setItems(new ArrayList<>(List.of(item)));
            completedBooking = bookingRepo.save(fake);
        }

        if (completedBooking == null) return;

        Service service = null;
        if (completedBooking.getItems() != null && !completedBooking.getItems().isEmpty()) {
            service = completedBooking.getItems().get(0).getService();
        }

        if (service == null) return;

        Customer customer = completedBooking.getCustomer();

        Review review = Review.builder()
                .customer(customer)
                .service(service)
                .booking(completedBooking)
                .rating(4)
                .content("Trải nghiệm tốt, nhân viên thân thiện, đồ ăn ổn.")
                .images(List.of("/uploads/reviews/images/sample_review_img1.jpg"))
                .videos(List.of("/uploads/reviews/videos/sample_review_vid1.mp4"))
                .reply("Cảm ơn bạn đã đánh giá!")
                .status(ReviewStatus.APPROVED)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        reviewRepository.save(review);

        completedBooking.setHasReview(true);
        bookingRepo.save(completedBooking);

        int prevCount = service.getTotalReviews() != null ? service.getTotalReviews() : 0;
        double prevAvg = service.getAverageRating() != null ? service.getAverageRating() : 0.0;
        int newCount = prevCount + 1;
        double newAvg = ((prevAvg * prevCount) + review.getRating()) / newCount;
        service.setTotalReviews(newCount);
        service.setAverageRating(newAvg);
        serviceRepo.save(service);
    }


    private void seedCombos(List<Service> services) {
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

        if (!services.isEmpty()) {
            Service s1 = services.get(0);
            Service s2 = services.size() > 1 ? services.get(1) : s1;
            Service s3 = services.size() > 2 ? services.get(2) : s1;
            Service s4 = services.size() > 3 ? services.get(3) : s1;
            Service s5 = services.size() > 4 ? services.get(4) : s1;
            Service s6 = services.size() > 5 ? services.get(5) : s1;
            Service s14 = services.size() > 6 ? services.get(6) : s1;

            familyCombo.setItems(new ArrayList<>(List.of(
                    ComboItem.builder().combo(familyCombo).service(s1).quantity(1).build(),
                    ComboItem.builder().combo(familyCombo).service(s2).quantity(1).build(),
                    ComboItem.builder().combo(familyCombo).service(s3).quantity(4).build(),
                    ComboItem.builder().combo(familyCombo).service(s4).quantity(4).build()
            )));

            adventureCombo.setItems(new ArrayList<>(List.of(
                    ComboItem.builder().combo(adventureCombo).service(s5).quantity(1).build(),
                    ComboItem.builder().combo(adventureCombo).service(s1).quantity(4).build(),
                    ComboItem.builder().combo(adventureCombo).service(s4).quantity(4).build()
            )));

            natureCombo.setItems(new ArrayList<>(List.of(
                    ComboItem.builder().combo(natureCombo).service(s3).quantity(1).build(),
                    ComboItem.builder().combo(natureCombo).service(s3).quantity(1).build(),
                    ComboItem.builder().combo(natureCombo).service(s5).quantity(4).build()
            )));

            teamBuildingCombo.setItems(new ArrayList<>(List.of(
                    ComboItem.builder().combo(teamBuildingCombo).service(s5).quantity(1).build(),
                    ComboItem.builder().combo(teamBuildingCombo).service(s4).quantity(4).build(),
                    ComboItem.builder().combo(teamBuildingCombo).service(s6).quantity(1).build()
            )));

            weekendEscapeCombo.setItems(new ArrayList<>(List.of(
                    ComboItem.builder().combo(weekendEscapeCombo).service(s2).quantity(1).build(),
                    ComboItem.builder().combo(weekendEscapeCombo).service(s4).quantity(4).build(),
                    ComboItem.builder().combo(weekendEscapeCombo).service(s2).quantity(1).build()
            )));

            riverAdventureCombo.setItems(new ArrayList<>(List.of(
                    ComboItem.builder().combo(riverAdventureCombo).service(s14).quantity(4).build(),
                    ComboItem.builder().combo(riverAdventureCombo).service(s6).quantity(1).build(),
                    ComboItem.builder().combo(riverAdventureCombo).service(s3).quantity(4).build()
            )));
        }

        comboRepo.save(familyCombo);
        comboRepo.save(adventureCombo);
        comboRepo.save(natureCombo);
        comboRepo.save(teamBuildingCombo);
        comboRepo.save(weekendEscapeCombo);
        comboRepo.save(riverAdventureCombo);
    }
}
