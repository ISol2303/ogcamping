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
<<<<<<< HEAD
        // URL public: /uploads/services/**
        // Thư mục trên server: C:/ogcamping/uploads/services/
        registry.addResourceHandler("/uploads/services/**")
                .addResourceLocations("file:///C:/Users/hieud/Desktop/ogcamping/backendOG/uploads/services/");
    }
=======
        // Services
        registry.addResourceHandler("/uploads/services/**")
                .addResourceLocations("file:///C:/Users/hieud/Desktop/Ogcamping/backendOG/uploads/services");

        // Combos
        registry.addResourceHandler("/uploads/combos/**")
                .addResourceLocations("file:///C:/Users/hieud/Desktop/Ogcamping/backendOG/uploads/combos/");
    }

>>>>>>> 4b112d9 (Add or update frontend & backend code)
}
