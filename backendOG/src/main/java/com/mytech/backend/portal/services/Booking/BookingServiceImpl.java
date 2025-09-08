package com.mytech.backend.portal.services.Booking;

import com.mytech.backend.portal.dto.Booking.BookingItemResponseDTO;
import com.mytech.backend.portal.dto.Booking.BookingRequestDTO;
import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.dto.Booking.BookingServiceDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.dto.Rating.ReviewRequestDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingItem;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Booking.ItemType;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Equipment.Equipment;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.models.Service.ServiceAvailability;
import com.mytech.backend.portal.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final ComboRepository comboRepository;
    private final CustomerRepository customerRepository;
    private final ServiceAvailabilityRepository serviceAvailabilityRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingItemRepository bookingItemRepository;

    @Override
    @Transactional
    public BookingResponseDTO placeBooking(Long customerId, BookingRequestDTO req) {
        // 1. Lấy customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // 2. Tạo booking gốc
        Booking booking = Booking.builder()
                .customer(customer)
                .note(req.getNote())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        List<BookingItem> bookingItems = new ArrayList<>();

        // 3. Xử lý dịch vụ lưu trú
        if (req.getServices() != null) {
            for (BookingServiceDTO s : req.getServices()) {
                Service service = serviceRepository.findById(s.getServiceId())
                        .orElseThrow(() -> new RuntimeException("Service not found: " + s.getServiceId()));

                // Validate ngày
                if (s.getCheckInDate() == null || s.getCheckOutDate() == null) {
                    throw new RuntimeException("Check-in/check-out required for service: " + service.getName());
                }
                if (!s.getCheckOutDate().isAfter(s.getCheckInDate())) {
                    throw new RuntimeException("Check-out must be after check-in for service: " + service.getName());
                }

                long days = ChronoUnit.DAYS.between(s.getCheckInDate(), s.getCheckOutDate());
                if (days <= 0) {
                    throw new RuntimeException("Booking must be at least 1 day for service: " + service.getName());
                }

                // Validate số ngày hợp lệ
                if (days < service.getMinDays() || days > service.getMaxDays()) {
                    throw new RuntimeException("Invalid number of days for service: " + service.getName());
                }

                // Validate số người
                int people = s.getNumberOfPeople();
                if (people < service.getMinCapacity()) {
                    throw new RuntimeException("Number of people below minimum for service: " + service.getName());
                }
                if (people > service.getMaxCapacity()) {
                    if (!Boolean.TRUE.equals(service.getAllowExtraPeople())) {
                        throw new RuntimeException("Number of people exceeds maximum for service: " + service.getName());
                    }
                    if (people > service.getMaxCapacity() + service.getMaxExtraPeople()) {
                        throw new RuntimeException("Number of people exceeds maximum with extra for service: " + service.getName());
                    }
                }

                // Check availability từng ngày
                LocalDate current = s.getCheckInDate();
                while (!current.isAfter(s.getCheckOutDate().minusDays(1))) {
                    LocalDate dateToCheck = current;
                    ServiceAvailability availability = serviceAvailabilityRepository
                            .findByServiceIdAndDate(service.getId(), dateToCheck)
                            .orElseThrow(() -> new RuntimeException("No availability config for date: " + dateToCheck));

                    if (availability.getBookedSlots() >= availability.getTotalSlots()) {
                        throw new RuntimeException("No available slots on " + dateToCheck);
                    }
                    current = current.plusDays(1);
                }

                double base = service.getPrice() != null ? service.getPrice() : 0.0;
                int capacity = service.getMaxCapacity() != null ? service.getMaxCapacity() : 0;
                int maxExtra = service.getMaxExtraPeople() != null ? service.getMaxExtraPeople() : 0;
                double extraFeePerPerson = service.getExtraFeePerPerson() != null ? service.getExtraFeePerPerson() : 0.0;

                int extraPeople = Math.max(0, people - capacity);
                int chargeableExtra = Math.min(extraPeople, maxExtra);

                double price = base + chargeableExtra * extraFeePerPerson;


                // Tạo BookingItem
                BookingItem item = BookingItem.builder()
                        .booking(booking) // 🔥 quan trọng
                        .service(service)
                        .type(ItemType.SERVICE)
                        .quantity(1)
                        .price(price)
                        .checkInDate(s.getCheckInDate())
                        .checkOutDate(s.getCheckOutDate())
                        .numberOfPeople(people)
                        .build();

                bookingItems.add(item);
            }
        }

        // 4. Xử lý combo
        if (req.getComboIds() != null) {
            for (Long comboId : req.getComboIds()) {
                Combo combo = comboRepository.findById(comboId)
                        .orElseThrow(() -> new RuntimeException("Combo not found: " + comboId));

                BookingItem item = BookingItem.builder()
                        .booking(booking) // 🔥 quan trọng
                        .combo(combo)
                        .type(ItemType.COMBO)
                        .quantity(1)
                        .price(combo.getPrice())
                        .build();

                bookingItems.add(item);
            }
        }

        // 5. Xử lý equipment
        if (req.getEquipmentIds() != null) {
            for (Long equipmentId : req.getEquipmentIds()) {
                Equipment equipment = equipmentRepository.findById(equipmentId)
                        .orElseThrow(() -> new RuntimeException("Equipment not found: " + equipmentId));

                BookingItem item = BookingItem.builder()
                        .booking(booking) // 🔥 quan trọng
                        .equipment(equipment)
                        .type(ItemType.EQUIPMENT)
                        .quantity(1)
                        .price(equipment.getPrice())
                        .build();

                bookingItems.add(item);
            }
        }

        // 6. Set items và tính tổng giá
        booking.setItems(bookingItems);
        booking.setTotalPrice(booking.calculateTotalPrice());

        // 7. Lưu booking (cascade sẽ lưu luôn items)
        booking = bookingRepository.save(booking);

        return mapToDTO(booking);
    }








    @Override
    public BookingResponseDTO getBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToDTO(booking);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.CONFIRMED
                && booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Cannot cancel this booking");
        }

        // Cập nhật trạng thái
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Trả lại slots cho tất cả service trong bookingItems
        for (BookingItem item : booking.getItems()) {
            if (item.getType() == ItemType.SERVICE && item.getService() != null) {
                Service service = item.getService();
                LocalDate current = booking.getCheckInDate();
                while (!current.isAfter(booking.getCheckOutDate().minusDays(1))) {
                    final LocalDate dateToCheck = current; // final variable
                    ServiceAvailability availability = serviceAvailabilityRepository
                            .findByServiceIdAndDate(service.getId(), dateToCheck)
                            .orElseThrow(() -> new RuntimeException("Availability not found for date: " + dateToCheck));

                    int booked = availability.getBookedSlots() != null ? availability.getBookedSlots() : 0;
                    if (booked > 0) {
                        availability.setBookedSlots(booked - 1);
                        serviceAvailabilityRepository.save(availability);
                    }

                    current = current.plusDays(1);
                }
            }
        }

        return mapToDTO(booking);
    }



    @Override
    @Transactional
    public BookingResponseDTO reviewBooking(Long bookingId, ReviewRequestDTO req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new RuntimeException("Only completed bookings can be reviewed");
        }

        booking.setRating(req.getRating());
        booking.setFeedback(req.getFeedback());
        bookingRepository.save(booking);

        // Cập nhật lại rating trung bình cho tất cả service trong bookingItems
        for (BookingItem item : booking.getItems()) {
            if (item.getType() == ItemType.SERVICE && item.getService() != null) {
                Service service = item.getService();
                int totalReviews = (service.getTotalReviews() == null ? 0 : service.getTotalReviews()) + 1;
                double avg = ((service.getAverageRating() == null ? 0.0 : service.getAverageRating())
                        * (totalReviews - 1) + req.getRating()) / totalReviews;

                service.setAverageRating(avg);
                service.setTotalReviews(totalReviews);
            }
        }

        return mapToDTO(booking);
    }

    @Override
    public long getConfirmedBookingsForCombo(Long comboId) {
        return bookingItemRepository.countByComboAndBookingStatus(
                comboId,
                BookingStatus.CONFIRMED
        );
    }
    @Override
    public long getRevenueByCombo(Long comboId) {
        return bookingItemRepository.getTotalRevenueByComboAndStatus(
                comboId, BookingStatus.CONFIRMED
        );
    }

    @Override
    public long getMonthlyRevenueByCombo(Long comboId) {
        return bookingItemRepository.getMonthlyRevenueByComboAndStatus(
                comboId, BookingStatus.CONFIRMED
        );
    }
    public BigDecimal getTotalSavings(Long comboId) {
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        long confirmedCount = bookingItemRepository.countByComboIdAndBookingStatus(
                comboId,
                BookingStatus.CONFIRMED
        );

        if (combo.getOriginalPrice() == null || combo.getPrice() == null) {
            return BigDecimal.ZERO;
        }

        // Convert Double -> BigDecimal để trừ
        BigDecimal savingPerBooking = BigDecimal.valueOf(combo.getOriginalPrice())
                .subtract(BigDecimal.valueOf(combo.getPrice()));

        return savingPerBooking.multiply(BigDecimal.valueOf(confirmedCount));
    }
    public long getTotalConfirmedBookingsFromAllCombos() {
        return bookingItemRepository.countAllConfirmedComboBookings();
    }

    // Mapper Booking -> DTO
    private BookingResponseDTO mapToDTO(Booking booking) {
        List<BookingItemResponseDTO> services = booking.getItems().stream()
                .filter(i -> i.getType() == ItemType.SERVICE && i.getService() != null)
                .map(i -> BookingItemResponseDTO.builder()
                        .id(i.getId())
                        .serviceId(i.getService().getId())
                        .bookingId(i.getBooking().getId())
                        .numberOfPeople(i.getNumberOfPeople().longValue())
                        .name(i.getService().getName())
                        .checkInDate(i.getCheckInDate())
                        .checkOutDate(i.getCheckOutDate())
                        .quantity(i.getQuantity())
                        .price(i.getPrice())
                        .total(i.getPrice() * i.getQuantity())
                        .build())
                .toList();

        List<BookingItemResponseDTO> combos = booking.getItems().stream()
                .filter(i -> i.getType() == ItemType.COMBO && i.getCombo() != null)
                .map(i -> BookingItemResponseDTO.builder()
                        .id(i.getId())
                        .name(i.getCombo().getName())
                        .quantity(i.getQuantity())
                        .price(i.getPrice())
                        .total(i.getPrice() * i.getQuantity())
                        .build())
                .toList();

        List<BookingItemResponseDTO> equipments = booking.getItems().stream()
                .filter(i -> i.getType() == ItemType.EQUIPMENT && i.getEquipment() != null)
                .map(i -> BookingItemResponseDTO.builder()
                        .id(i.getId())
                        .name(i.getEquipment().getName())
                        .quantity(i.getQuantity())
                        .price(i.getPrice())
                        .total(i.getPrice() * i.getQuantity())
                        .build())
                .toList();

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .services(services)
                .combos(combos)
                .equipments(equipments)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .numberOfPeople(booking.getNumberOfPeople())
                .status(booking.getStatus())
                .totalPrice(booking.getTotalPrice().doubleValue())
                .payment(booking.getPayment() != null ? PaymentResponseDTO.builder()
                        .id(booking.getPayment().getId())
                        .method(booking.getPayment().getMethod())
                        .status(booking.getPayment().getStatus())
                        .amount(booking.getPayment().getAmount())
                        .providerTransactionId(booking.getPayment().getProviderTransactionId())
                        .createdAt(booking.getPayment().getCreatedAt())
                        .build() : null)
                .note(booking.getNote())
                .build();
    }



    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponseDTO updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.valueOf(status));
        Booking updated = bookingRepository.save(booking);

        return mapToDTO(updated);
    }

    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }


}
