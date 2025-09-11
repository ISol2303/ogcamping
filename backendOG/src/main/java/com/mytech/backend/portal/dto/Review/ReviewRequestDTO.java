package com.mytech.backend.portal.dto.Review;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequestDTO {
    private Integer rating;      // ⭐ bắt buộc
    private String content = "";         // nếu không có thì mặc định chuỗi rỗng
    private List<String> images = new ArrayList<>(); // nếu không có thì danh sách trống
    private List<String> videos = new ArrayList<>(); // nếu không có thì danh sách trống
}
