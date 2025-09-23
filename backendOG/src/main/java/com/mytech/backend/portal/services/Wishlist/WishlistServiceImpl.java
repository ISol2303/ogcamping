package com.mytech.backend.portal.services.Wishlist;

import com.mytech.backend.portal.dto.Wishlist.WishlistItemDTO;
import com.mytech.backend.portal.models.Combo.Combo;
import com.mytech.backend.portal.models.Service.Service;
import com.mytech.backend.portal.models.User.User;
import com.mytech.backend.portal.models.Wishlist.WishlistItem;
import com.mytech.backend.portal.models.Wishlist.WishlistType;
import com.mytech.backend.portal.repositories.ComboRepository;
import com.mytech.backend.portal.repositories.ServiceRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import com.mytech.backend.portal.repositories.WishlistItemRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final ComboRepository comboRepository;

    @Override
    public List<WishlistItemDTO> getWishlistForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return wishlistRepository.findByUser(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    @Override
    public WishlistItemDTO addServiceToWishlist(Long userId, Long serviceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Kiểm tra xem đã tồn tại chưa
        Optional<WishlistItem> existing = wishlistRepository.findByUserAndTypeAndItemId(user, WishlistType.SERVICE, serviceId);
        if (existing.isPresent()) {
            throw new RuntimeException("Service already in wishlist");
        }

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .type(WishlistType.SERVICE)
                .itemId(serviceId)
                .build();
        wishlistRepository.save(item);

        return mapToDTO(item);
    }


    @Override
    public WishlistItemDTO addComboToWishlist(Long userId, Long comboId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        wishlistRepository.findByUserAndTypeAndItemId(user, WishlistType.COMBO, comboId)
                .ifPresent(i -> { throw new RuntimeException("Combo already in wishlist"); });

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .type(WishlistType.COMBO)
                .itemId(comboId)
                .build();
        wishlistRepository.save(item);

        return mapToDTO(item);
    }

    @Override
    public void removeItemFromWishlist(Long userId, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WishlistItem item = wishlistRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Cannot remove item from another user's wishlist");
        }

        wishlistRepository.delete(item);
    }

    // Private helper để map WishlistItem -> WishlistItemDTO
    private WishlistItemDTO mapToDTO(WishlistItem item) {
        AtomicReference<String> nameRef = new AtomicReference<>("");
        AtomicReference<String> imageRef = new AtomicReference<>("");

        if (item.getType() == WishlistType.SERVICE) {
            serviceRepository.findById(item.getItemId()).ifPresent(s -> {
                nameRef.set(s.getName());
                imageRef.set(s.getImageUrl());
            });
        } else if (item.getType() == WishlistType.COMBO) {
            comboRepository.findById(item.getItemId()).ifPresent(c -> {
                nameRef.set(c.getName());
                imageRef.set(c.getImageUrl());
            });
        }

        return WishlistItemDTO.builder()
                .id(item.getId())
                .type(item.getType())
                .itemId(item.getItemId())
                .name(nameRef.get())
                .imageUrl(imageRef.get())
                .addedAt(item.getCreatedAt() != null ? item.getCreatedAt() : LocalDateTime.now())
                .build();
    }
}

