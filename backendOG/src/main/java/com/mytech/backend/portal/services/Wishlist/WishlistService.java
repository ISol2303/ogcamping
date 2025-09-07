package com.mytech.backend.portal.services.Wishlist;

import com.mytech.backend.portal.dto.Wishlist.WishlistItemDTO;
import com.mytech.backend.portal.models.Wishlist.WishlistType;

import java.util.List;

public interface WishlistService {
    List<WishlistItemDTO> getWishlistForUser(Long userId);
    WishlistItemDTO addServiceToWishlist(Long userId, Long serviceId);
    WishlistItemDTO addComboToWishlist(Long userId, Long comboId);
    void removeItemFromWishlist(Long userId, Long itemId);
}

