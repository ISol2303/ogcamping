package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Equipment.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    // Nếu cần custom query thì thêm ở đây
}

