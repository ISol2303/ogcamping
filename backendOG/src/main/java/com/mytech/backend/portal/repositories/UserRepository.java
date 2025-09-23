package com.mytech.backend.portal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mytech.backend.portal.models.User.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.name LIKE %:searchText% " +
           "OR u.email LIKE %:searchText% " +
           "OR u.phone LIKE %:searchText% " +
           "OR u.department LIKE %:searchText%")
    List<User> search(@Param("searchText") String searchText);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    // Corrected to return Optional<User> instead of Optional<UserDTO>
    Optional<User> findById(Long id);
    
    Optional<User> findByResetCode(String resetCode);


    @Query("SELECT sa.user FROM ShiftAssignment sa " +
            "WHERE sa.shift.shiftDate = :date " +
            "AND sa.shift.status IN ('APPROVED','IN_PROGRESS')")

    List<User> findByRole(User.Role role);

    // Method used in ShiftServiceImpl previously (if you implemented it)
    @Query("""
        SELECT DISTINCT u FROM User u
        JOIN ShiftAssignment sa ON sa.user = u
        JOIN Shift s ON sa.shift = s
        WHERE ( (s.shiftDate >= :fromDate) AND (s.shiftDate <= :toDate) )
    """)
    List<User> findStaffInActiveShift(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);
}
