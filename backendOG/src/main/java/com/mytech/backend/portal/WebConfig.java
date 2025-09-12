package com.mytech.backend.portal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**")
                .allowedOrigins("http://localhost:3000");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String basePath = "file:///" + uploadDir.replace("\\", "/") + "/";

        // Services
        registry.addResourceHandler("/uploads/services/**")
                .addResourceLocations(basePath + "services/");

        // Combos
        registry.addResourceHandler("/uploads/combos/**")
                .addResourceLocations(basePath + "combos/");

        // Reviews - images
        registry.addResourceHandler("/uploads/reviews/images/**")
                .addResourceLocations(basePath + "reviews/images/");

        // Reviews - videos
        registry.addResourceHandler("/uploads/reviews/videos/**")
                .addResourceLocations(basePath + "reviews/videos/");
    }
}
