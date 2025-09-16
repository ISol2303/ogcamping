package com.mytech.backend.portal.apis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.mytech.backend.portal.dto.ResetPasswordRequestDTO;
import com.mytech.backend.portal.dto.UserDTO;
import com.mytech.backend.portal.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/apis/v1/users", "/apis/test/users"})
@RequiredArgsConstructor
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        try {
            return ResponseEntity.ok(userService.createUser(userDTO));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to create user: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<UserDTO> getUser(@PathVariable("id") Long id) {
        try {
            UserDTO user = userService.getUserById(id);
            if (user == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable("id") Long id, @RequestBody UserDTO userDTO) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, userDTO));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to update user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete user: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch users: " + e.getMessage());
        }
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam(name = "email") String email) {
        UserDTO userDTO = userService.getUserByEmail(email);
        return ResponseEntity.ok(userDTO);
    }
    
    // Gửi email reset password
 // Case: user chưa đăng nhập -> cần nhập email
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPasswordGuest(@RequestParam(name = "email") String email) {
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không được để trống");
        }
        userService.sendResetCode(email);
        return ResponseEntity.ok("OTP đã được gửi tới " + email);
    }

    // Case: user đã đăng nhập -> lấy email từ token
    @PostMapping("/forgot-password/authenticated")
    public ResponseEntity<String> forgotPasswordAuth(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bạn chưa đăng nhập");
        }
        String targetEmail = authentication.getName();
        userService.sendResetCode(targetEmail);
        return ResponseEntity.ok("OTP đã được gửi tới " + targetEmail);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        userService.resetPassword(request.getCode(), request.getNewPassword());
        return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.");
    }

}
