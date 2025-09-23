package com.mytech.backend.portal.repositories;

import com.mytech.backend.portal.models.User.User;
import com.mytech.backend.portal.models.Wishlist.WishlistItem;
import com.mytech.backend.portal.models.Wishlist.WishlistType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    // Lấy tất cả wishlist của user
    List<WishlistItem> findByUser(User user);

    // Kiểm tra item đã tồn tại trong wishlist của user chưa
    Optional<WishlistItem> findByUserAndTypeAndItemId(User user, WishlistType type, Long itemId);
}