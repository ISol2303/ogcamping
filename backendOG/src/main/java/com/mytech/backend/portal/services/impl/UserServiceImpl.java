package com.mytech.backend.portal.services.impl;

import com.mytech.backend.portal.dto.StatDTO;
import com.mytech.backend.portal.dto.UserDTO;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.User.User;
import com.mytech.backend.portal.repositories.*;
import com.mytech.backend.portal.services.EmailService;
import com.mytech.backend.portal.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;   // dùng interface
    private final BookingRepository bookingRepository;
    private final PackageRepository packageRepository;
    private final GearRepository gearRepository;
    private final CustomerRepository customerRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        User user = User.builder()
                .name(userDTO.getName())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword())) // encode password
                .phone(userDTO.getPhone())
                .role(userDTO.getRole() != null ? User.Role.valueOf(userDTO.getRole()) : User.Role.CUSTOMER)
                .status(userDTO.getStatus() != null ? User.Status.valueOf(userDTO.getStatus()) : User.Status.ACTIVE)
                .build();
        user = userRepository.save(user);

        // Customer mặc định cho user mới
        Customer customer = Customer.builder()
                .name(userDTO.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(userDTO.getAddress())
                .user(user)
                .build();
        customerRepository.save(customer);

        return mapToDTO(user, customer);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Customer customer = customerRepository.findByUser(user).orElse(null);
        return mapToDTO(user, customer);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(u -> mapToDTO(u, customerRepository.findByUser(u).orElse(null)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        if (userDTO.getRole() != null) {
            user.setRole(User.Role.valueOf(userDTO.getRole()));
        }
        if (userDTO.getStatus() != null) {
            user.setStatus(User.Status.valueOf(userDTO.getStatus()));
        }

        user = userRepository.save(user);

        // Update customer
        Customer customer = customerRepository.findByUser(user).orElse(null);
        if (customer != null) {
            customer.setName(userDTO.getName());
            customer.setEmail(userDTO.getEmail());
            customer.setPhone(userDTO.getPhone());
            customer.setAddress(userDTO.getAddress());
            customerRepository.save(customer);
        }

        return mapToDTO(user, customer);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user); // cascade sẽ xóa customer nếu thiết lập
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);

        return mapToDTO(user, customer);
    }

    // --- mapping User & Customer sang DTO ---
    private UserDTO mapToDTO(User user, Customer customer) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setStatus(user.getStatus().name());
        dto.setAgreeMarketing(user.getAgreeMarketing());
        dto.setAvatar(user.getAvatar());
        dto.setCreatedAt(user.getCreatedAt());
        if (customer != null) {
            dto.setAddress(customer.getAddress());
        }
        return dto;
    }

    @Override
    public UserDTO findById(Long id) {
        return getUserById(id);
    }

    @Override
    public Collection<StatDTO> findAllStats() {
        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long totalPackages = packageRepository.count();
        long totalGears = gearRepository.count();

        List<StatDTO> stats = new ArrayList<>();
        stats.add(new StatDTO("Total Users", totalUsers));
        stats.add(new StatDTO("Total Bookings", totalBookings));
        stats.add(new StatDTO("Total Packages", totalPackages));
        stats.add(new StatDTO("Total Gears", totalGears));

        return stats;
    }

    public void sendResetCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với email: " + email));

        // Sinh OTP (6 số)
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Lưu vào DB
        user.setResetCode(otp);
        user.setResetCodeExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        // Gửi email
        String subject = "Mã OTP đặt lại mật khẩu";
        String body = "Mã OTP của bạn là: " + otp + "\nMã có hiệu lực trong 5 phút.";
        emailService.sendResetPasswordCode(user.getEmail(), subject, body);

        System.out.println("Reset code cho " + email + " : " + otp);
    }

    public void resetPassword(String code, String newPassword) {
        User user = userRepository.findByResetCode(code)
                .orElseThrow(() -> new RuntimeException("Mã xác thực không hợp lệ."));

        if (user.getResetCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetCode(null); // clear code sau khi dùng
        user.setResetCodeExpiry(null);
        userRepository.save(user);
    }
}
