package com.mytech.backend.portal.apis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.mytech.backend.portal.dto.UserDTO;
import com.mytech.backend.portal.repositories.UserRepository;
import com.mytech.backend.portal.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/apis/v1/users", "/apis/test/users"})
@RequiredArgsConstructor
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

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
    
    // Lấy user hiện tại (dựa trên token)
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            }
            UserDTO user = userService.getUserByEmail(userDetails.getUsername());
            if (user == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch current user: " + e.getMessage());
        }
    }
    //user cập nhật thông tin cá nhân
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDTO userDTO) {
        try {
            if (userDetails == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
            }

            // lấy user hiện tại từ email trong token
            UserDTO currentUser = userService.getUserByEmail(userDetails.getUsername());
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
            }

            // kiểm tra email mới (nếu có)
            if (userDTO.getEmail() != null && !userDTO.getEmail().equals(currentUser.getEmail())) {
                if (userRepository.existsByEmail(userDTO.getEmail())) {
                    throw new IllegalArgumentException("Email already in use");
                }
            }

            // gọi service update profile
            UserDTO updatedUser = userService.updateProfile(currentUser.getId(), userDTO);
            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to update profile: " + e.getMessage());
        }
    }

}