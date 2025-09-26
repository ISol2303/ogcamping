package com.mytech.backend.portal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String basePath = "file:///" + uploadDir.replace("\\", "/") + "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(basePath)
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());

        // Services
        registry.addResourceHandler("/uploads/services/**")
                .addResourceLocations(basePath + "services/")
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());

        // Combos
        registry.addResourceHandler("/uploads/combos/**")
                .addResourceLocations(basePath + "combos/")
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());

        // Reviews - images
        registry.addResourceHandler("/uploads/reviews/images/**")
                .addResourceLocations(basePath + "reviews/images/")
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());

        // Reviews - videos
        registry.addResourceHandler("/uploads/reviews/videos/**")
                .addResourceLocations(basePath + "reviews/videos/")
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
    }

}
