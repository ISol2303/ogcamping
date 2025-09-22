package com.mytech.backend.portal.dto.Customer;
import com.mytech.backend.portal.dto.UserDTO;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomerResponseDTO {
    private Long id;
    private String name;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private Long userId;  
    private UserDTO user;
}
