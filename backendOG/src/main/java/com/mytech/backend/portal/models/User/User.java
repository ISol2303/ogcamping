package com.mytech.backend.portal.models.User;

import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.UserProvider.UserProvider;
import com.mytech.backend.portal.models.Wishlist.WishlistItem;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    private String firstName;
    private String lasttName;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    // Bỏ @NotBlank để login Google không lỗi
    private String password;

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

    // Quan hệ với Customer
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Customer customer;

    // Cho phép nhiều provider cho cùng 1 user
    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<UserProvider> providers = new HashSet<>();

    // Wishlist
    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WishlistItem> wishlist = new ArrayList<>();

    // reset password
    private String resetCode;
    private LocalDateTime resetCodeExpiry;

    @PrePersist
    public void prePersist() {
        if (role == null) role = Role.CUSTOMER;
        if (status == null) status = Status.ACTIVE;
        if (agreeMarketing == null) agreeMarketing = false;
        if (createdAt == null) createdAt = LocalDateTime.now();

        // Defensive: đảm bảo providers không null (phòng các object không dùng builder)
        if (providers == null) {
            providers = new HashSet<>();
        }

        // Đảm bảo luôn có provider LOCAL nếu chưa có
        boolean hasLocal = providers.stream()
                .anyMatch(p -> p.getProvider() == UserProvider.Provider.LOCAL);

        if (!hasLocal) {
            // providerId cho LOCAL: dùng email nếu có, ngược lại fallback timestamp
            String pid = (this.email != null && !this.email.isBlank()) ? this.email : "local-" + System.currentTimeMillis();
            UserProvider localProvider = UserProvider.of(this, UserProvider.Provider.LOCAL, pid);
            providers.add(localProvider);
        }
    }

    // Helper tiện lợi (option): thêm provider an toàn
    public void addProvider(UserProvider provider) {
        if (providers == null) providers = new HashSet<>();
        if (provider != null) {
            provider.setUser(this);
            providers.add(provider);
        }
    }

    public enum Role {
        CUSTOMER, STAFF, ADMIN
    }

    public enum Status {
        ACTIVE, INACTIVE
    }
}
