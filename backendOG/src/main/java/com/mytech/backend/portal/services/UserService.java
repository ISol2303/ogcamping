package com.mytech.backend.portal.services;

import com.mytech.backend.portal.dto.StatDTO;
import com.mytech.backend.portal.dto.UserDTO;
import com.mytech.backend.portal.models.User;

import java.util.Collection;
import java.util.List;

public interface UserService {
    UserDTO createUser(UserDTO userDTO);
    UserDTO getUserById(Long id);
    List<UserDTO> getAllUsers();
    UserDTO updateUser(Long id, UserDTO userDTO);
    void deleteUser(Long id);
    User findByEmail(String email);
    User save(User user);
    UserDTO findById(Long id);
    Collection<StatDTO> findAllStats(); // đổi tên rõ ràng
}
