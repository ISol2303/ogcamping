package com.mytech.backend.portal.models;

import com.mytech.backend.portal.models.Customer.Customer;
<<<<<<< HEAD
=======
import com.mytech.backend.portal.models.Wishlist.WishlistItem;
>>>>>>> 4b112d9 (Add or update frontend & backend code)
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
<<<<<<< HEAD
=======
import java.util.ArrayList;
import java.util.List;
>>>>>>> 4b112d9 (Add or update frontend & backend code)

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    // Bỏ @NotBlank để login Google không lỗi
    @Column(nullable = true)
    private String password;

    @Column(nullable = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String department;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "agree_marketing", nullable = false)
    private Boolean agreeMarketing;

    private String avatar;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (role == null) role = Role.CUSTOMER;
        if (status == null) status = Status.ACTIVE;
        if (agreeMarketing == null) agreeMarketing = false;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Customer customer;

    public enum Role {
        CUSTOMER, STAFF, ADMIN
    }

    public enum Status {
        ACTIVE, INACTIVE
    }
    @Column(name = "google_Id", nullable = true)
    private String googleId;
<<<<<<< HEAD
=======
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WishlistItem> wishlist = new ArrayList<>();
>>>>>>> 4b112d9 (Add or update frontend & backend code)
}
