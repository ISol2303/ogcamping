package com.mytech.backend.portal.dto.Wishlist;

import com.mytech.backend.portal.models.Wishlist.WishlistType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemDTO {
    private Long id;
    private WishlistType type;   // SERVICE / COMBO
    private Long itemId;         // id của Service hoặc Combo
    private String name;         // tên dịch vụ hoặc combo
    private String imageUrl;     // ảnh dịch vụ hoặc combo
    private LocalDateTime addedAt;
}
