package com.mytech.backend.portal.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mytech.backend.portal.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.name LIKE %:searchText% " +
           "OR u.email LIKE %:searchText% " +
           "OR u.phone LIKE %:searchText% " +
           "OR u.department LIKE %:searchText%")
    List<User> search(@Param("searchText") String searchText);

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    // Corrected to return Optional<User> instead of Optional<UserDTO>
    Optional<User> findById(Long id);
}