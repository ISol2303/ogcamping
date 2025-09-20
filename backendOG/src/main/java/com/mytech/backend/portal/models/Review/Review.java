package com.mytech.backend.portal.models.Review;

import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.Service.Service;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer nào để lại review
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // Review cho service nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    // Số sao (1–5)
    @Column(nullable = false)
    private Integer rating;

    // Nội dung review
    @Column(columnDefinition = "TEXT")
    private String content;

    // Danh sách ảnh (tối đa 3–4 cái)
    @ElementCollection
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    // Danh sách video (nếu có)
    @ElementCollection
    @CollectionTable(name = "review_videos", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "video_url")
    private List<String> videos = new ArrayList<>();

    // Phản hồi review (vd: admin/host phản hồi)
    @Column(columnDefinition = "TEXT")
    private String reply;

    // Thời gian tạo
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // --- moderation fields ---
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING; // mặc định PENDING
    
    // ai duyệt (lưu user id của staff)
    private Long moderatedById;

    private String moderatedByName;

    private LocalDateTime moderatedAt;

    @Column(columnDefinition = "TEXT")
    private String moderationReason; // lý do từ chối hoặc note
}
