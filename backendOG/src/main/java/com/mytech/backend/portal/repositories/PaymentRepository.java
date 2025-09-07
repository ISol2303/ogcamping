package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.dto.Payment.PaymentResponseDTO;
import com.mytech.backend.portal.models.Payment.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByProviderTransactionId(String providerTransactionId);
}