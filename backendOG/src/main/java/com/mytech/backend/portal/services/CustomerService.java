package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.dto.CustomerRequestDTO;
import com.mytech.backend.portal.dto.CustomerResponseDTO;

public interface CustomerService {
    CustomerResponseDTO getCustomer(Long id);
    CustomerResponseDTO createCustomer(CustomerRequestDTO req);
    CustomerResponseDTO updateCustomer(Long id, CustomerRequestDTO req);
    List<CustomerResponseDTO> getAllCustomers();
}
