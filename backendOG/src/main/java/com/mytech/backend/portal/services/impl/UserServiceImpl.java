package com.mytech.backend.portal.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.UserDTO;
import com.mytech.backend.portal.exceptions.ResourceAlreadyExistsException;
import com.mytech.backend.portal.exceptions.ResourceNotFoundException;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.repositories.UserRepository;
import com.mytech.backend.portal.services.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists: " + userDTO.getEmail());
        }
        User user = User.builder()
                .name(userDTO.getName())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .phone(userDTO.getPhone())
                .role(userDTO.getRole() != null ? User.Role.valueOf(userDTO.getRole()) : User.Role.CUSTOMER)
                .department(userDTO.getDepartment())
                .joinDate(userDTO.getJoinDate())
                .status(userDTO.getStatus() != null ? User.Status.valueOf(userDTO.getStatus()) : User.Status.ACTIVE)
                .agreeMarketing(userDTO.getAgreeMarketing() != null ? userDTO.getAgreeMarketing() : false)
                .build();
        user = userRepository.save(user);
        return mapToDTO(user);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDTO(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        user.setPhone(userDTO.getPhone());
        user.setRole(userDTO.getRole() != null ? User.Role.valueOf(userDTO.getRole()) : user.getRole());
        user.setDepartment(userDTO.getDepartment());
        user.setJoinDate(userDTO.getJoinDate());
        user.setStatus(userDTO.getStatus() != null ? User.Status.valueOf(userDTO.getStatus()) : user.getStatus());
        user.setAgreeMarketing(userDTO.getAgreeMarketing() != null ? userDTO.getAgreeMarketing() : user.getAgreeMarketing());
        user = userRepository.save(user);
        return mapToDTO(user);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
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
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToDTO(user); // Use mapToDTO for consistency
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .department(user.getDepartment())
                .joinDate(user.getJoinDate())
                .status(user.getStatus().name())
                .agreeMarketing(user.getAgreeMarketing())
                .build();
    }
}