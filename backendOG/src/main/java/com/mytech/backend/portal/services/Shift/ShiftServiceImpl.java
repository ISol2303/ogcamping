package com.mytech.backend.portal.services.Shift;

import com.mytech.backend.portal.dto.Shift.ShiftResponseDTO;
import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.Shift.AssignmentRole;
import com.mytech.backend.portal.models.Shift.Shift;
import com.mytech.backend.portal.models.Shift.ShiftAssignment;
import com.mytech.backend.portal.models.Shift.ShiftStatus;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.BookingRepository;
import com.mytech.backend.portal.repositories.ShiftRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class ShiftServiceImpl implements ShiftService {

    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public ShiftServiceImpl(ShiftRepository shiftRepository,
                            UserRepository userRepository,
                            BookingRepository bookingRepository) {
        this.shiftRepository = shiftRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    // ---------------- QUẢN LÝ CA ----------------

    @Override
    public Shift registerShift(Long staffId, LocalDate date, LocalTime start, LocalTime end) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        Shift shift = Shift.builder()
                .shiftDate(date)
                .startTime(start)
                .endTime(end)
                .status(ShiftStatus.REGISTERED)
                .build();

        ShiftAssignment assignment = ShiftAssignment.builder()
                .shift(shift)
                .user(staff)
                .role(AssignmentRole.STAFF)
                .build();

        shift.getAssignments().add(assignment);


        return shiftRepository.save(shift);
    }


    @Override
    public Shift approveShift(Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        shift.setStatus(ShiftStatus.APPROVED);
        return shiftRepository.save(shift);
    }

    @Override
    public Shift startShift(Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        shift.setStatus(ShiftStatus.IN_PROGRESS);
        return shiftRepository.save(shift);
    }

    @Override
    public Shift completeShift(Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        shift.setStatus(ShiftStatus.COMPLETED);
        return shiftRepository.save(shift);
    }

    @Override
    public Shift cancelShift(Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        shift.setStatus(ShiftStatus.CANCELLED);
        return shiftRepository.save(shift);
    }

    // ---------------- GÁN BOOKING ----------------

    @Override
    public Booking assignBookingManually(Long bookingId, Long staffId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        booking.setAssignedStaff(staff);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking assignBookingAutomatically(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Kiểm tra checkIn/checkOut
        if (booking.getCheckInDate() == null || booking.getCheckOutDate() == null) {
            throw new RuntimeException("Booking check-in/check-out date is missing");
        }

        // Lấy danh sách nhân viên đang trong ca trực (APPROVED hoặc IN_PROGRESS)
        // Dùng LocalDateTime thay vì LocalDate
        List<User> availableStaff = userRepository.findStaffInActiveShift(
                booking.getCheckInDate(), booking.getCheckOutDate()
        );

        if (availableStaff.isEmpty()) {
            throw new RuntimeException("No available staff in current shift");
        }

        // Chọn nhân viên có ít booking nhất để cân bằng workload
        User selected = availableStaff.stream()
                .min(Comparator.comparingInt(staff -> bookingRepository.countByAssignedStaff(staff)))
                .orElseThrow();

        booking.setAssignedStaff(selected);
        return bookingRepository.save(booking);
    }

    // ------------------------
    // HÀM SUPPORT
    // ------------------------
    public Shift findByIdOrThrow(Long shiftId) {
        return shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
    }

    // ------------------------
    // MAPPING: Shift -> DTO
    // ------------------------
    public ShiftResponseDTO toDTO(Shift shift) {
        ShiftResponseDTO dto = new ShiftResponseDTO();
        dto.setId(shift.getId());
        dto.setShiftDate(shift.getShiftDate());
        dto.setStartTime(shift.getStartTime());
        dto.setEndTime(shift.getEndTime());
        dto.setStatus(shift.getStatus());

        List<ShiftResponseDTO.AssignmentDTO> assignmentDTOs = shift.getAssignments().stream()
                .map(assignment -> new ShiftResponseDTO.AssignmentDTO(
                        assignment.getUser().getId(),
                        assignment.getUser().getName(), // hoặc getFullName()
                        assignment.getRole()
                ))
                .toList();

        dto.setAssignments(assignmentDTOs);
        return dto;
    }
}
