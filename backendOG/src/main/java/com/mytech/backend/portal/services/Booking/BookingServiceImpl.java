package com.mytech.backend.portal.services.Booking;

import com.mytech.backend.portal.dto.Booking.BookingRequestDTO;
import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.dto.Rating.ReviewRequestDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Booking.BookingStatus;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.ComboRepository;
import com.mytech.backend.portal.repositories.CustomerRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
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

    @Override
    public BookingResponseDTO placeBooking(Long customerId, BookingRequestDTO req) {
        // 1. Tìm customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // 2. Tìm service hoặc combo
        Service service = null;
        Combo combo = null;
        if (req.getServiceId() != null) {
            service = serviceRepository.findById(req.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found"));
        }
        if (req.getComboId() != null) {
            combo = comboRepository.findById(req.getComboId())
                    .orElseThrow(() -> new RuntimeException("Combo not found"));
        }
        if (service == null && combo == null) {
            throw new RuntimeException("Must choose service or combo");
        }

        // 3. Validate ngày
        if (req.getCheckInDate() == null || req.getCheckOutDate() == null) {
            throw new RuntimeException("Check-in and check-out dates required");
        }
        if (req.getCheckInDate().isAfter(req.getCheckOutDate())) {
            throw new RuntimeException("Check-out must be after check-in");
        }

        long days = ChronoUnit.DAYS.between(req.getCheckInDate(), req.getCheckOutDate());
        if (service != null) {
            if (days < service.getMinDays() || days > service.getMaxDays()) {
                throw new RuntimeException("Invalid number of days for service");
            }
            if (req.getNumberOfPeople() < service.getMinCapacity()
                    || req.getNumberOfPeople() > service.getMaxCapacity()) {
                throw new RuntimeException("Invalid number of people for service");
            }
            if (service.getAvailableSlots() <= 0) {
                throw new RuntimeException("No available slots for this service");
            }
            // giảm slot
            service.setAvailableSlots(service.getAvailableSlots() - 1);
        }

        // 4. Tạo booking
        Booking booking = Booking.builder()
                .customer(customer)
                .service(service)
                .combo(combo)
                .checkInDate(req.getCheckInDate())
                .checkOutDate(req.getCheckOutDate())
                .numberOfPeople(req.getNumberOfPeople())
                .status(BookingStatus.PENDING)
                .note(req.getNote())
                .build();

        booking = bookingRepository.save(booking);

        // 5. Trả về DTO
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
    public BookingResponseDTO cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);

            // Trả lại slot cho service
            if (booking.getService() != null) {
                booking.getService().setAvailableSlots(
                        booking.getService().getAvailableSlots() + 1
                );
            }
        } else {
            throw new RuntimeException("Cannot cancel this booking");
        }
        return mapToDTO(booking);
    }

    @Override
    public BookingResponseDTO reviewBooking(Long bookingId, ReviewRequestDTO req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new RuntimeException("Only completed bookings can be reviewed");
        }

        booking.setRating(req.getRating());
        booking.setFeedback(req.getFeedback());
        bookingRepository.save(booking);

        // Cập nhật lại rating trung bình cho Service
        if (booking.getService() != null) {
            Service service = booking.getService();
            int totalReviews = (service.getTotalReviews() == null ? 0 : service.getTotalReviews()) + 1;
            double avg = ((service.getAverageRating() == null ? 0.0 : service.getAverageRating())
                    * (totalReviews - 1) + req.getRating()) / totalReviews;

            service.setAverageRating(avg);
            service.setTotalReviews(totalReviews);
        }

        return mapToDTO(booking);
    }

    // Mapper Booking -> DTO
    private BookingResponseDTO mapToDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .serviceName(booking.getService() != null ? booking.getService().getName() : null)
                .comboName(booking.getCombo() != null ? booking.getCombo().getName() : null)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .numberOfPeople(booking.getNumberOfPeople())
                .status(booking.getStatus())
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
