package com.mytech.backend.portal.models.Combo;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
<<<<<<< HEAD
@Table(name="combos")
@Getter
@Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Combo {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Double price;       // giá combo
    private Boolean active = true;

    @OneToMany(mappedBy="combo", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<ComboItem> items = new ArrayList<>();
}

=======
@Table(name = "combos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Combo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;            // Tên combo
    private String description;     // Mô tả
    private Double price;           // Giá combo
    private Double originalPrice;   // Giá gốc (nếu có giảm giá)
    private Integer discount;       // % giảm giá
    private Boolean active = true;  // Trạng thái bật/tắt
    private String imageUrl;        // Ảnh đại diện

    private Double rating;          // Điểm trung bình (VD: 4.5)
    private Integer reviewCount;    // Tổng số lượt đánh giá

    private String location;        // Địa điểm tổ chức
    private String duration;        // Thời lượng combo (VD: "2 ngày 1 đêm")

    private Integer minPeople;      // Số người tối thiểu
    private Integer maxPeople;      // Số người tối đa
    private Integer minDays;      // Số người tối đa
    private Integer maxDays;      // Số người tối đa

    @ElementCollection
    @CollectionTable(name = "combo_highlights", joinColumns = @JoinColumn(name = "combo_id"))
    @Column(name = "highlight")
    private List<String> highlights = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "combo_tags", joinColumns = @JoinColumn(name = "combo_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();


    @OneToMany(mappedBy = "combo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComboItem> items = new ArrayList<>();
}


>>>>>>> 4b112d9 (Add or update frontend & backend code)
