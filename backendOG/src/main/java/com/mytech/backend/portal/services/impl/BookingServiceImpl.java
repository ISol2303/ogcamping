package com.mytech.backend.portal.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.BookingDTO;
import com.mytech.backend.portal.models.Booking;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import com.mytech.backend.portal.services.BookingService;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<BookingDTO> getBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id " + id));
        return convertToDTO(booking);
    }

    @Override
    public BookingDTO createBooking(BookingDTO bookingDTO) {
        log.info("Creating booking: {}", bookingDTO);

        Booking booking = new Booking();
        booking.setService(bookingDTO.getService());
        booking.setDate(bookingDTO.getDate());
        booking.setImage(bookingDTO.getImage());
        booking.setAmount(bookingDTO.getAmount());
        booking.setRating(bookingDTO.getRating());
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        // Nếu createdBy khác "guest" thì coi như user login
        if (bookingDTO.getCreatedBy() != null && !"guest".equalsIgnoreCase(bookingDTO.getCreatedBy())) {
            userRepository.findById(Long.parseLong(bookingDTO.getCreatedBy())).ifPresentOrElse(
                user -> {
                    booking.setUser(user);
                    log.info("Booking linked with user: {}", user.getEmail());
                },
                () -> {
                    log.warn("User not found with id {}, booking sẽ là Guest", bookingDTO.getCreatedBy());
                    booking.setUser(null);
                }
            );
        } else {
            log.info("Booking created by Guest with email {}", bookingDTO.getEmail());
            booking.setUser(null);
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Booking saved successfully with ID: {}", saved.getId());

        return convertToDTO(saved);
    }

    @Override
    public BookingDTO updateBooking(Long id, BookingDTO bookingDTO) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id " + id));

        booking.setService(bookingDTO.getService());
        booking.setDate(bookingDTO.getDate());
        booking.setImage(bookingDTO.getImage());
        booking.setStatus(Booking.BookingStatus.valueOf(bookingDTO.getStatus()));
        booking.setAmount(bookingDTO.getAmount());
        booking.setRating(bookingDTO.getRating());

        Booking updated = bookingRepository.save(booking);
        return convertToDTO(updated);
    }

    @Override
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new EntityNotFoundException("Booking not found with id " + id);
        }
        bookingRepository.deleteById(id);
    }

    private BookingDTO convertToDTO(Booking booking) {
        return new BookingDTO(
                booking.getId(),
                booking.getUser() != null ? booking.getUser().getPhone() : null,
                booking.getUser() != null ? booking.getUser().getEmail() : null,
                null,
                booking.getUser() != null ? String.valueOf(booking.getUser().getId()) : "guest",
                null,
                booking.getUser() != null ? booking.getUser().getName() : "Guest",
                booking.getService(),
                booking.getDate(),
                booking.getImage(),
                booking.getStatus().name(),
                booking.getAmount(),
                booking.getRating(),
                booking.getCreatedAt()
        );
    }
}
