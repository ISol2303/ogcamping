package com.mytech.backend.portal.services;

import java.util.List;

import com.mytech.backend.portal.models.Blog;
import com.mytech.backend.portal.models.Location;

public interface BlogService {
    // ADMIN
    List<Blog> getAllBlogs();
    Blog changeStatus(Long id, Blog.Status status);

    // CUSTOMER
    List<Blog> getBlogsByStatus(Blog.Status status);
    Blog getBlogById(Long id);

    // STAFF
    List<Blog> getBlogsByUser(String email);
    Blog createBlog(Blog blog);
    Blog updateBlogByUser(Long id, Blog blog, String email);
    Blog submitForReview(Long id, String email);
    Blog updateBlog(Blog blog);
    Blog generateAIBlog(Location location);
    Blog generateAIBlogForExisting(Long id);
    Blog rejectPendingBlog(Long id, String feedback, String adminEmail);
}
