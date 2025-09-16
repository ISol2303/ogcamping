package com.mytech.backend.portal.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.mytech.backend.portal.models.BlogVersion;

public interface BlogVersionRepository extends JpaRepository<BlogVersion, Long> {
    List<BlogVersion> findByBlogIdOrderByCreatedAtDesc(Long blogId);
}