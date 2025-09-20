package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Shift.ShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {
    List<ShiftAssignment> findByShiftId(Long shiftId);
    List<ShiftAssignment> findByUserId(Long userId);
    Optional<ShiftAssignment> findByShiftIdAndUserId(Long shiftId, Long userId);
    void deleteByShiftIdAndUserId(Long shiftId, Long userId);
    int countByShiftId(Long shiftId);
}