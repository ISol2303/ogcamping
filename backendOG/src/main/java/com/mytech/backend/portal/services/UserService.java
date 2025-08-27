package com.mytech.backend.portal.services;

import com.mytech.backend.portal.dto.StatDTO;
import com.mytech.backend.portal.dto.UserDTO;
import com.mytech.backend.portal.models.User;

import java.util.Collection;
import java.util.List;


public interface UserService {
    UserDTO createUser(UserDTO userDTO);          // Tạo user và customer tự động
    UserDTO getUserById(Long id);                // Lấy user theo ID
    List<UserDTO> getAllUsers();                 // Lấy tất cả users
    UserDTO updateUser(Long id, UserDTO userDTO);// Cập nhật user
    void deleteUser(Long id);                    // Xóa user + customer nếu cascade
    User findByEmail(String email);              // Tìm user theo email
    User save(User user);                        // Save trực tiếp entity
    Collection<StatDTO> findAllStats();          // Thống kê user
    UserDTO findById(Long id);
    UserDTO getUserByEmail(String email);
}

