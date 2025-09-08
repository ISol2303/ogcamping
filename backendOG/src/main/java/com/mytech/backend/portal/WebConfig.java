package com.mytech.backend.portal;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**")
                .allowedOrigins("http://localhost:3000");
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Services
        registry.addResourceHandler("/uploads/services/**")
                .addResourceLocations("file:///D:/DANG/Git/ogcamping-git/ogcamping/backendOG/uploads/services/");

        // Combos
        registry.addResourceHandler("/uploads/combos/**")
                .addResourceLocations("file:///D:/DANG/Git/ogcamping-git/ogcamping/backendOG/uploads/combos/");
    }

}
