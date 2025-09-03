package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.dto.Wishlist.WishlistAddRequest;
import com.mytech.backend.portal.dto.Wishlist.WishlistItemDTO;
import com.mytech.backend.portal.models.Wishlist.WishlistType;
import com.mytech.backend.portal.services.Wishlist.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/apis/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;

    @GetMapping("/{userId}")
    public List<WishlistItemDTO> getWishlist(@PathVariable("userId") Long userId) {
        return wishlistService.getWishlistForUser(userId);
    }

    @PostMapping("/service/{serviceId}")
    public WishlistItemDTO addService(
            @RequestParam("userId") Long userId,  // thêm "userId" trong @RequestParam
            @PathVariable("serviceId") Long serviceId) {
        return wishlistService.addServiceToWishlist(userId, serviceId);
    }




    @PostMapping("/combo/{comboId}")
    public WishlistItemDTO addCombo(@RequestParam Long userId, @PathVariable Long comboId) {
        return wishlistService.addComboToWishlist(userId, comboId);
    }

    @DeleteMapping("/{itemId}")
    public void removeItem(@RequestParam Long userId, @PathVariable Long itemId) {
        wishlistService.removeItemFromWishlist(userId, itemId);
    }
}

