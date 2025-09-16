package com.mytech.backend.portal.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blog_versions")
public class BlogVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long blogId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private String createdBy;

    private LocalDateTime createdAt;

    private String versionType; // ORIGINAL | BEFORE_AI | AI | MANUAL

    public BlogVersion() {}

    public BlogVersion(Long blogId, String title, String content, String summary, String createdBy, LocalDateTime createdAt, String versionType) {
        this.blogId = blogId;
        this.title = title;
        this.content = content;
        this.summary = summary;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.versionType = versionType;
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBlogId() { return blogId; }
    public void setBlogId(Long blogId) { this.blogId = blogId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getVersionType() { return versionType; }
    public void setVersionType(String versionType) { this.versionType = versionType; }
}
