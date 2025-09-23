package com.mytech.backend.portal.models.Wishlist;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import com.mytech.backend.portal.models.User.User;

import lombok.*;

@Entity
@Table(name = "wishlist_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private WishlistType type; // SERVICE / COMBO

    private Long itemId; // id của Service hoặc Combo

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt = LocalDateTime.now();
}



