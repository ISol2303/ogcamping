package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Booking.BookingResponseDTO;
import com.mytech.backend.portal.dto.Customer.CustomerRequestDTO;
import com.mytech.backend.portal.dto.Customer.CustomerResponseDTO;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.repositories.CustomerRepository;
import com.mytech.backend.portal.services.Customer.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/apis/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomer(id));
    }

    @PostMapping
    public ResponseEntity<CustomerResponseDTO> createCustomer(@RequestBody CustomerRequestDTO req) {
        return ResponseEntity.ok(customerService.createCustomer(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> updateCustomer(@PathVariable Long id,
                                                              @RequestBody CustomerRequestDTO req) {
        return ResponseEntity.ok(customerService.updateCustomer(id, req));
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponseDTO>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }
}
