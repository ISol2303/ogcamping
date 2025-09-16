package com.mytech.backend.portal.apis;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.itextpdf.io.exceptions.IOException;
import com.mytech.backend.portal.models.Blog;
import com.mytech.backend.portal.models.Location;
import com.mytech.backend.portal.repositories.BlogRepository;
import com.mytech.backend.portal.repositories.LocationRepository;
import com.mytech.backend.portal.services.BlogService;
import com.mytech.backend.portal.services.FileStorageService;

@RestController
@RequestMapping("/apis/blogs")
public class BlogController {
	private final BlogRepository blogRepository;
    private final BlogService blogService;
    private final LocationRepository locationRepository;
    private final FileStorageService fileStorageService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public BlogController(BlogService blogService, LocationRepository locationRepository , FileStorageService fileStorageService , BlogRepository blogRepository , SimpMessagingTemplate messagingTemplate ) {
        this.blogService = blogService;
        this.locationRepository = locationRepository;
        this.fileStorageService = fileStorageService;
        this.blogRepository = blogRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // ========================= CUSTOMER =========================

    // CUSTOMER: xem danh sách blog đã publish
    @GetMapping("/public")
    public ResponseEntity<List<Blog>> getPublicBlogs() {
        return ResponseEntity.ok(blogService.getBlogsByStatus(Blog.Status.PUBLISHED));
    }

    // CUSTOMER: xem chi tiết blog đã publish
    @GetMapping("/public/{id}")
    public ResponseEntity<Blog> getPublicBlogById(@PathVariable("id") Long id) {
        Blog blog = blogService.getBlogById(id);
        if (blog == null || blog.getStatus() != Blog.Status.PUBLISHED) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(blog);
    }

    // ========================= STAFF =========================

    // STAFF: xem tất cả blogs của chính mình
    @GetMapping("/staff/all")
    public ResponseEntity<List<Blog>> getStaffBlogs(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(blogService.getBlogsByUser(email));
    }

    // STAFF: xem chi tiết 1 blog của mình (kể cả DRAFT, UNPUBLISHED)
    @GetMapping("/staff/{id}")
    public ResponseEntity<Blog> getStaffBlogById(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Blog blog = blogService.getBlogById(id);
        if (blog == null || !blog.getCreatedBy().equals(email)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(blog);
    }

    // STAFF: tạo blog (auto DRAFT)
    @PostMapping("/staff/create")
    public ResponseEntity<Blog> createBlog(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "locationName", required = false) String locationName,
            @RequestParam(value = "locationDescription", required = false) String locationDescription,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            Authentication authentication
    ) throws IOException, java.io.IOException {
        Blog blog = new Blog();
        blog.setTitle(title);
        blog.setContent(content);
        blog.setStatus(Blog.Status.DRAFT);
        blog.setCreatedBy(authentication.getName());

        // Xử lý ảnh
        if (thumbnail != null && !thumbnail.isEmpty()) {
            String fileUrl = fileStorageService.saveFile(thumbnail);
            blog.setThumbnail(thumbnail.getOriginalFilename());
            blog.setImageUrl(fileUrl);
        }

        // Xử lý location
        if (locationName != null || locationDescription != null) {
            Location location = new Location(locationName, locationDescription);
            blog.setLocation(locationRepository.save(location));
        }

        Blog saved = blogService.createBlog(blog);
        return ResponseEntity.ok(saved);
    }

    // STAFF: update blog khi còn draft/unpublished
    @PutMapping("/staff/{id}")
    public ResponseEntity<Blog> updateBlog(
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "locationName", required = false) String locationName,
            @RequestParam(value = "locationDescription", required = false) String locationDescription,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            Authentication authentication
    ) throws IOException, java.io.IOException {
        Blog blog = blogService.getBlogById(id);
        if (blog == null || !blog.getCreatedBy().equals(authentication.getName())) {
            return ResponseEntity.notFound().build();
        }

        blog.setTitle(title);
        blog.setContent(content);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            if (blog.getImageUrl() != null) {
                fileStorageService.deleteFile(blog.getImageUrl());
            }
            String fileUrl = fileStorageService.saveFile(thumbnail);
            blog.setThumbnail(thumbnail.getOriginalFilename());
            blog.setImageUrl(fileUrl);
        }

        if (locationName != null || locationDescription != null) {
            Location location = new Location(locationName, locationDescription);
            blog.setLocation(locationRepository.save(location));
        }

        Blog updated = blogService.updateBlog(blog);
        return ResponseEntity.ok(updated);
    }

    // STAFF: gửi yêu cầu publish (status -> PENDING)
    @PutMapping("/staff/{id}/submit")
    public ResponseEntity<Blog> submitForReview(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Blog updated = blogService.submitForReview(id, email);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/staff/updates")
    public ResponseEntity<List<Blog>> getStaffBlogUpdates(
            @RequestParam("since") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<Blog> updates = blogRepository.findByCreatedByAndLastModifiedAtAfter(email, since);
        return ResponseEntity.ok(updates);
    }



    // ========================= ADMIN =========================

    // ADMIN: xem tất cả blogs đang chờ duyệt (PENDING)
    @GetMapping("/admin")
    public ResponseEntity<List<Blog>> getPendingAndPublishedBlogsForAdmin() {
        List<Blog> pendingBlogs = blogService.getBlogsByStatus(Blog.Status.PENDING);
        List<Blog> publishedBlogs = blogService.getBlogsByStatus(Blog.Status.PUBLISHED);

        List<Blog> combined = new ArrayList<>();
        combined.addAll(pendingBlogs);
        combined.addAll(publishedBlogs);

        return ResponseEntity.ok(combined);
    }


    // ADMIN: xem chi tiết blog (PENDING hoặc PUBLISHED)
    @GetMapping("/admin/{id}")
    public ResponseEntity<Blog> getBlogForAdmin(@PathVariable("id") Long id) {
        Blog blog = blogService.getBlogById(id);
        if (blog == null) {
            return ResponseEntity.notFound().build();
        }
        if (blog.getStatus() != Blog.Status.PENDING && blog.getStatus() != Blog.Status.PUBLISHED) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(blog);
    }

    // ADMIN: publish blog
 // ADMIN: publish blog
    @PostMapping("/admin/{id}/publish")
    public ResponseEntity<Blog> publishBlog(@PathVariable("id") Long id) {
        Blog updated = blogService.changeStatus(id, Blog.Status.PUBLISHED);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        // 🚀 Gửi realtime cho Staff
        messagingTemplate.convertAndSend("/topic/blog-updates", updated);

        return ResponseEntity.ok(updated);
    }

    // ADMIN: unpublish blog
    @PostMapping("/admin/{id}/unpublish")
    public ResponseEntity<Blog> unpublishBlog(@PathVariable("id") Long id) {
        Blog updated = blogService.changeStatus(id, Blog.Status.PENDING);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        // 🚀 Gửi realtime cho Staff
        System.out.println("Sending blog update via WS: " + updated.getId() + " status=" + updated.getStatus());
        messagingTemplate.convertAndSend("/topic/blog-updates", updated);


        return ResponseEntity.ok(updated);
    }

    // ADMIN: dùng AI để cập nhật lại blog hiện tại (giữ status PENDING)
    @PostMapping("/admin/{id}/aigen")
    public ResponseEntity<Map<String, Object>> generateAIBlogFromExisting(@PathVariable("id") Long id) {
        Blog blog = blogService.getBlogById(id);
        if (blog == null || blog.getLocation() == null) {
            return ResponseEntity.notFound().build();
        }
        Blog updated = blogService.generateAIBlogForExisting(id);

        Map<String, Object> response = new HashMap<>();
        response.put("blog", updated);
        if (updated.getSummary() != null && updated.getSummary().contains("⚠️")) {
            response.put("message", updated.getSummary());
            response.put("status", "quota_exceeded");
        } else {
            response.put("message", "AI Gen thành công (bài vẫn ở trạng thái PENDING).");
            response.put("status", "ok");
        }

        return ResponseEntity.ok(response);
    }

 // ADMIN: reject blog (trả về DRAFT + feedback)
    @PostMapping("/admin/{id}/reject")
    public ResponseEntity<Blog> rejectBlog(
            @PathVariable("id") Long id,
            @RequestParam("feedback") String feedback
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String adminEmail = authentication.getName();
        Blog rejected = blogService.rejectPendingBlog(id, feedback, adminEmail);
        if (rejected == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rejected);
    }

    

}
