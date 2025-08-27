package com.mytech.backend.portal.services.Customer;

import java.util.List;

import com.mytech.backend.portal.dto.Customer.CustomerRequestDTO;
import com.mytech.backend.portal.dto.Customer.CustomerResponseDTO;

public interface CustomerService {
    CustomerResponseDTO getCustomer(Long id);
    CustomerResponseDTO createCustomer(CustomerRequestDTO req);
    CustomerResponseDTO updateCustomer(Long id, CustomerRequestDTO req);
    List<CustomerResponseDTO> getAllCustomers();
}
