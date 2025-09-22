package com.mytech.backend.portal.models.Service;


import com.mytech.backend.portal.models.Booking.BookingItem;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;            // VD: Cắm trại núi cao Sapa
    private String description;     // Mô tả chi tiết
    private Double price;           // Giá trọn gói/ service
    private String location;        // VD: Sapa, Lào Cai

    private Integer minDays;        // VD: 2
    private Integer maxDays;        // VD: 3

    // Sức chứa
    private Integer minCapacity;    // VD: 3
    private Integer maxCapacity;    // VD: 5

    private Integer defaultSlotsPerDay;   // mặc định số slot/ngày (vd: 5)
    private Boolean active = true;
    private Double averageRating;   // VD: 4.8
    private Integer totalReviews;   // VD: 124
    private String duration;        // Ví dụ: "2-3 ngày"
    private String capacity;        // Ví dụ: "4-6 người"
    private Boolean isExperience;
    @Enumerated(EnumType.STRING)
    private ServiceTag tag;         // POPULAR / NEW / DISCOUNT

    private String imageUrl;  // Ảnh chính của service

    // Danh sách ảnh phụ
    @ElementCollection
    @CollectionTable(name = "service_extra_images", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "image_url")
    private List<String> extraImageUrls = new ArrayList<>();

    // ====== BỔ SUNG CHO CASE 3 ======
    private Boolean allowExtraPeople = false;  // Có cho phép thêm người ngoài maxCapacity không?
    private Double extraFeePerPerson = 0.0;    // Phí phụ thu/người vượt quá
    private Integer maxExtraPeople = 0;        // Giới hạn số người vượt thêm (vd: chỉ cho tối đa +2)

    private Boolean requireAdditionalSiteIfOver = true;

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceAvailability> availability = new ArrayList<>();


    // Danh sách highlights
    @ElementCollection
    @CollectionTable(name = "service_highlights", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "highlight")
    private List<String> highlights = new ArrayList<>();

    // Danh sách included items
    @ElementCollection
    @CollectionTable(name = "service_included", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "item")
    private List<String> included = new ArrayList<>();

    // Lịch trình chi tiết (itinerary)
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItineraryItem> itinerary = new ArrayList<>();

    // Reviews
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceReview> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingItem> bookingItems = new ArrayList<>();
}


