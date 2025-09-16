package com.mytech.backend.portal.dto.Customer;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomerResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
}
