package com.mytech.backend.portal.models.Customer;

import com.mytech.backend.portal.models.Booking.Booking;
import com.mytech.backend.portal.models.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "name", nullable = true)
    private String name;

    @NotBlank
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true, unique = true)
    private String phone;

    private String address;

    private String avatar;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Booking> bookings = new ArrayList<>();
}

