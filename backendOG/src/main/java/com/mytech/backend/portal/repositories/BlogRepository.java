package com.mytech.backend.portal.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mytech.backend.portal.models.Blog;

public interface BlogRepository  extends JpaRepository<Blog, Long> {
	List<Blog> findByStatus(Blog.Status status);
    List<Blog> findByCreatedBy(String email);
    List<Blog> findByCreatedByAndLastModifiedAtAfter(String createdBy, LocalDateTime since);

}

