package com.mytech.backend.portal.models.UserProvider;

import java.util.Objects;

import com.mytech.backend.portal.models.User.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_providers",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"provider", "provider_id"}) // 1 providerId duy nhất cho 1 provider
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Provider provider;

    @Column(name = "provider_id", nullable = false, length = 191)
    private String providerId; // sub (Google) hoặc id (Facebook) hoặc email (LOCAL)

    @ManyToOne(fetch = FetchType.LAZY, optional = false) // user_id bắt buộc
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum Provider {
        LOCAL, GOOGLE, FACEBOOK
    }

    // Helper factory method
    public static UserProvider of(User user, Provider provider, String providerId) {
        return UserProvider.builder()
                .provider(provider)
                .providerId(providerId)
                .user(user)
                .build();
    }

    // Để tránh duplicate trong Set<UserProvider>
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserProvider that)) return false;
        return provider == that.provider &&
               Objects.equals(providerId, that.providerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(provider, providerId);
    }
}
