package com.mytech.backend.portal.dto;

public class BlogDTO {
    private String title;
    private String content;
    private String thumbnail;
    private Long locationId;
    

    public BlogDTO() {
    }

    public BlogDTO(String title, String content, String thumbnail, Long locationId) {
        this.title = title;
        this.content = content;
        this.thumbnail = thumbnail;
        this.locationId = locationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }
}
