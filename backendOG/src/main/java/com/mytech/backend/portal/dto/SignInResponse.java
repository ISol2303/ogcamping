package com.mytech.backend.portal.dto;

import java.io.Serializable;

import com.mytech.backend.portal.models.User.User.Role;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SignInResponse implements Serializable {
    private static final long serialVersionUID = 1691310343751417289L;

    private Long id;
    private String fullname;
    private String email;
    private Role role = Role.CUSTOMER;

    private String token;
    private String refreshToken;
    private String tokenType = "Bearer";
}
