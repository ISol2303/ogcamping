package com.mytech.backend.portal.dto.Customer;
import lombok.*;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerRequestDTO {
    private String name;
    private String email;
    private String phone;
    private String address;
}
