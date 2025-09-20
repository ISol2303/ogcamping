package com.mytech.backend.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.mytech.backend.portal")
@EnableJpaRepositories(basePackages = "com.mytech.backend.portal.repositories")
public class BackendOgApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendOgApplication.class, args);
	}

}
