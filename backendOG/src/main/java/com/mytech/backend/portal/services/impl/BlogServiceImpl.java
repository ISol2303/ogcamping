package com.mytech.backend.portal.services.impl;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.mytech.backend.portal.dto.GeneratedBlog;
import com.mytech.backend.portal.models.Blog;
import com.mytech.backend.portal.models.Blog.BlogType;
import com.mytech.backend.portal.models.Blog.Status;
import com.mytech.backend.portal.models.BlogVersion;
import com.mytech.backend.portal.models.Location;
import com.mytech.backend.portal.repositories.BlogRepository;
import com.mytech.backend.portal.repositories.BlogVersionRepository;
import com.mytech.backend.portal.services.AIService;
import com.mytech.backend.portal.services.BlogService;

@Service
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final BlogVersionRepository versionRepository;
    private final AIService aiService;
    private final SimpMessagingTemplate messagingTemplate;


    @Autowired
    public BlogServiceImpl(
            BlogRepository blogRepository,
            BlogVersionRepository versionRepository,
            AIService aiService,
            SimpMessagingTemplate messagingTemplate) {
        this.blogRepository = blogRepository;
        this.versionRepository = versionRepository;
        this.aiService = aiService;
        this.messagingTemplate = messagingTemplate;
    }


    // ================= ADMIN =================
    @Override
    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    @Override
    public Blog changeStatus(Long id, Blog.Status status) {
        Optional<Blog> existingOpt = blogRepository.findById(id);
        if (existingOpt.isEmpty()) return null;

        Blog existing = existingOpt.get();
        existing.setStatus(status);
        existing.setLastModifiedAt(LocalDateTime.now());
        Blog saved = blogRepository.save(existing);

        // 🔥 Gửi thông báo realtime cho staff tạo blog đó
        messagingTemplate.convertAndSend(
                "/topic/blog-updates/" + saved.getCreatedBy(),
                saved
        );

        return saved;
    }


    // ================= CUSTOMER =================
    @Override
    public List<Blog> getBlogsByStatus(Blog.Status status) {
        return blogRepository.findByStatus(status);
    }

    @Override
    public Blog getBlogById(Long id) {
        return blogRepository.findById(id).orElse(null);
    }

    // ================= STAFF =================
    @Override
    public List<Blog> getBlogsByUser(String email) {
        return blogRepository.findByCreatedBy(email);
    }

    @Override
    public Blog createBlog(Blog blog) {
        if (blog.getStatus() == null) blog.setStatus(Blog.Status.DRAFT);
        return blogRepository.save(blog);
    }

    @Override
    public Blog updateBlog(Blog blog) {
        return blogRepository.save(blog);
    }

    @Override
    public Blog submitForReview(Long id, String email) {
        Optional<Blog> optional = blogRepository.findById(id);
        if (optional.isEmpty()) return null;

        Blog blog = optional.get();

        if (!blog.getCreatedBy().equals(email)) {
            return null; // chỉ owner mới được submit
        }

        blog.setStatus(Blog.Status.PENDING);
        blog.setLastModifiedAt(LocalDateTime.now());
        Blog saved = blogRepository.save(blog);

        try {
            // 🔥 Notify admin (topic chung)
            messagingTemplate.convertAndSend(
                    "/topic/admin/blog-updates",
                    saved
            );

            // 🔥 Notify staff (user riêng)
            messagingTemplate.convertAndSendToUser(
                    saved.getCreatedBy(),
                    "/queue/blog-updates",
                    saved
            );
        } catch (Exception e) {
            System.err.println("⚠️ Lỗi gửi WebSocket submit: " + e.getMessage());
        }

        return saved;
    }

    // ================= AI GENERATE =================
    @Override
    public Blog generateAIBlogForExisting(Long id) {
        Optional<Blog> optional = blogRepository.findById(id);
        if (optional.isEmpty()) return null;
        Blog blog = optional.get();

        if (blog.getStatus() != Status.PENDING) {
            return null; // chỉ gen AI khi đang pending
        }

        // Lưu version trước khi AI gen
        BlogVersion before = new BlogVersion(blog.getId(),
                blog.getTitle(),
                blog.getContent(),
                blog.getSummary(),
                blog.getLastModifiedBy() != null ? blog.getLastModifiedBy() : blog.getCreatedBy(),
                LocalDateTime.now(),
                "BEFORE_AI");
        versionRepository.save(before);

        GeneratedBlog gen;
        try {
            gen = aiService.generateFromBlog(blog); // gọi OpenAI
        } catch (Exception ex) {
            // Fallback khi có lỗi (bao gồm 429 quota exceeded)
            gen = new GeneratedBlog();
            gen.setTitle(blog.getTitle());
            gen.setContent(blog.getContent());
            gen.setSummary("AI không tạo được bài vì quota OpenAI hết hoặc lỗi: " + ex.getMessage());
            gen.setKeywords(Arrays.asList("ai", "quota-exceeded"));
            gen.setThumbnailUrl(blog.getThumbnail());
            gen.setImageUrl(blog.getImageUrl());
        }

        // Cập nhật blog nếu AI trả content mới
        if (gen.getTitle() != null && !gen.getTitle().isBlank()) blog.setTitle(gen.getTitle());
        if (gen.getContent() != null && !gen.getContent().isBlank()) blog.setContent(gen.getContent());
        if (gen.getSummary() != null) blog.setSummary(gen.getSummary());
        if (gen.getKeywords() != null && !gen.getKeywords().isEmpty()) {
            blog.setKeywords(String.join(",", gen.getKeywords()));
        }
        if (gen.getThumbnailUrl() != null && !gen.getThumbnailUrl().isBlank()) {
            blog.setThumbnail(gen.getThumbnailUrl());
        }
        if (gen.getImageUrl() != null && !gen.getImageUrl().isBlank()) {
            blog.setImageUrl(gen.getImageUrl());
        }

        blog.setType(BlogType.AI);
        blog.setStatus(Status.PENDING); // vẫn giữ pending để admin review
        blog.setLastModifiedAt(LocalDateTime.now());
        blog.setLastModifiedBy("AI System");

        Blog saved = blogRepository.save(blog);

        BlogVersion aiVersion = new BlogVersion(saved.getId(),
                saved.getTitle(),
                saved.getContent(),
                saved.getSummary(),
                "AI System",
                LocalDateTime.now(),
                "AI");
        versionRepository.save(aiVersion);

        return saved;
    }


    @Override
    public Blog generateAIBlog(Location location) {
        GeneratedBlog gen = aiService.generateFromLocation(location);

        Blog blog = new Blog();
        blog.setTitle(gen.getTitle() != null ? gen.getTitle() : "Top địa điểm tại " + (location != null ? location.getName() : ""));
        blog.setContent(gen.getContent() != null ? gen.getContent() : "");
        blog.setSummary(gen.getSummary());
        blog.setKeywords(gen.getKeywords() != null ? String.join(",", gen.getKeywords()) : null);
        blog.setThumbnail(gen.getThumbnailUrl());
        blog.setImageUrl(gen.getImageUrl());
        blog.setCreatedBy("AI System");
        blog.setLocation(location);
        blog.setType(BlogType.AI);
        blog.setStatus(Status.PENDING);
        blog.setLastModifiedAt(LocalDateTime.now());
        blog.setLastModifiedBy("AI System");

        Blog saved = blogRepository.save(blog);

        BlogVersion v = new BlogVersion(saved.getId(),
                saved.getTitle(),
                saved.getContent(),
                saved.getSummary(),
                "AI System",
                LocalDateTime.now(),
                "AI_CREATED");
        versionRepository.save(v);

        return saved;
    }

    @Override
    public Blog rejectPendingBlog(Long id, String feedback, String adminEmail) {
        Optional<Blog> optional = blogRepository.findById(id);
        if (optional.isEmpty()) return null;
        Blog blog = optional.get();

        if (blog.getStatus() != Status.PENDING) return null;

        // Lưu version trước khi reject
        BlogVersion prev = new BlogVersion(
                blog.getId(),
                blog.getTitle(),
                blog.getContent(),
                blog.getSummary(),
                adminEmail,
                LocalDateTime.now(),
                "REJECT_BEFORE"
        );
        versionRepository.save(prev);

        // Cập nhật blog
        blog.setRejectedReason(feedback);
        blog.setStatus(Status.DRAFT);
        blog.setLastModifiedAt(LocalDateTime.now());
        blog.setLastModifiedBy(adminEmail);

        Blog saved = blogRepository.save(blog);

        // 🔥 1. Gửi riêng cho staff (chỉ người tạo blog mới nhận)
        try {
            messagingTemplate.convertAndSendToUser(
                    saved.getCreatedBy(),          // staff email/username
                    "/queue/blog-updates",         // staff FE subscribe
                    saved
            );
        } catch (Exception e) {
            System.err.println("⚠️ Lỗi gửi WebSocket cho staff: " + e.getMessage());
        }

        // 🔥 2. Broadcast cho tất cả (admin/staff khác cũng nhận được)
        try {
            messagingTemplate.convertAndSend(
                    "/topic/blog-updates",         // FE subscribe ở đây
                    saved
            );
        } catch (Exception e) {
            System.err.println("⚠️ Lỗi gửi WebSocket broadcast: " + e.getMessage());
        }

        return saved;
    }


    @Override
    public Blog updateBlogByUser(Long id, Blog updatedBlog, String email) {
        Optional<Blog> optional = blogRepository.findById(id);
        if (optional.isEmpty()) return null;

        Blog existing = optional.get();

        // chỉ owner mới được update blog của mình
        if (!existing.getCreatedBy().equals(email)) {
            return null;
        }

        // chỉ cho update khi còn draft hoặc bị reject
        if (existing.getStatus() == Status.PENDING || existing.getStatus() == Status.PUBLISHED) {
            return null;
        }

        // lưu version trước khi update
        BlogVersion beforeUpdate = new BlogVersion(
                existing.getId(),
                existing.getTitle(),
                existing.getContent(),
                existing.getSummary(),
                email,
                LocalDateTime.now(),
                "USER_UPDATE_BEFORE"
        );
        versionRepository.save(beforeUpdate);

        // cập nhật thông tin
        existing.setTitle(updatedBlog.getTitle());
        existing.setContent(updatedBlog.getContent());
        existing.setSummary(updatedBlog.getSummary());
        existing.setKeywords(updatedBlog.getKeywords());
        existing.setThumbnail(updatedBlog.getThumbnail());
        existing.setImageUrl(updatedBlog.getImageUrl());
        existing.setLastModifiedAt(LocalDateTime.now());
        existing.setLastModifiedBy(email);

        Blog saved = blogRepository.save(existing);

        // lưu version sau update
        BlogVersion afterUpdate = new BlogVersion(
                saved.getId(),
                saved.getTitle(),
                saved.getContent(),
                saved.getSummary(),
                email,
                LocalDateTime.now(),
                "USER_UPDATE_AFTER"
        );
        versionRepository.save(afterUpdate);

        return saved;
    }


}
