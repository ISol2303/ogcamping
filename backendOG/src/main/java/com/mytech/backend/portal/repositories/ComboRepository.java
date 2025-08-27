package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.Combo.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Long> {}