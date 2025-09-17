package com.mytech.backend.portal.services;

import com.mytech.backend.portal.dto.GeneratedBlog;
import com.mytech.backend.portal.models.Blog;
import com.mytech.backend.portal.models.Location;

public interface AIService {
    // Generate based on an existing Blog (title, location, brief content)
    GeneratedBlog generateFromBlog(Blog blog);

    // Generate based only on a Location (legacy)
    GeneratedBlog generateFromLocation(Location location);
}