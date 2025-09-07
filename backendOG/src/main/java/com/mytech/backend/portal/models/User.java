package com.mytech.backend.portal.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
	}
        