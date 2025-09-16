package com.mytech.backend.portal.services.Customer;

import com.mytech.backend.portal.dto.Customer.CustomerRequestDTO;
import com.mytech.backend.portal.dto.Customer.CustomerResponseDTO;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.repositories.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public CustomerResponseDTO getCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return mapToDTO(customer);
    }

    @Override
    public CustomerResponseDTO createCustomer(CustomerRequestDTO req) {
        Customer customer = Customer.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .build();
        customerRepository.save(customer);
        return mapToDTO(customer);
    }

    @Override
    public CustomerResponseDTO updateCustomer(Long id, CustomerRequestDTO req) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        customer.setFirstName(req.getFirstName());
        customer.setLastName(req.getLastName());
        customer.setEmail(req.getEmail());
        customer.setPhone(req.getPhone());
        customer.setAddress(req.getAddress());
        customerRepository.save(customer);
        return mapToDTO(customer);
    }

    @Override
    public List<CustomerResponseDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    private CustomerResponseDTO mapToDTO(Customer customer) {
        return CustomerResponseDTO.builder()
                .id(customer.getId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .userId(customer.getUser().getId())
                .build();
    }
}
