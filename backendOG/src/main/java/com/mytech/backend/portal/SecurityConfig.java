package com.mytech.backend.portal;

import com.mytech.backend.portal.security.AppUserDetailsService;
import com.mytech.backend.portal.security.AuthTokenFilter;
import com.mytech.backend.portal.security.oauth2.OAuth2FailureHandler;
import com.mytech.backend.portal.security.oauth2.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;



@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	@Autowired
	private AppUserDetailsService userDetailsService;
	private final OAuth2SuccessHandler oAuth2SuccessHandler;
	private final OAuth2FailureHandler oAuth2FailureHandler;
	  @Bean
	  CorsConfigurationSource corsConfigurationSource() {
	    CorsConfiguration configuration = new CorsConfiguration();
	    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
	    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
	    configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
	    configuration.setAllowCredentials(true);
	    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	    source.registerCorsConfiguration("/**", configuration);
	    return source;
	  }
//	@Bean
//	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//		http.authorizeHttpRequests((authorite) -> authorite
//				.requestMatchers("/apis/v1/login", "/apis/test/**").permitAll().anyRequest().permitAll());
//
//		http.formLogin((form) -> form.defaultSuccessUrl("/"));
//
//		http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
//
//		http.csrf(csrf -> csrf.disable());
//
//		return http.build();
//	}
@Bean
@Order(1)
SecurityFilterChain oauth2Chain(HttpSecurity http) throws Exception {
	http
			.securityMatcher("/oauth2/**", "/login/**", "/error")
			.authorizeHttpRequests(auth -> auth
					.requestMatchers("/oauth2/**", "/login/**", "/error").permitAll()
					.anyRequest().authenticated()
			)
			.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
			.csrf(csrf -> csrf.ignoringRequestMatchers("/oauth2/**", "/login/**"))
			.oauth2Login(oauth2 -> oauth2
					.loginPage("/oauth2/authorization/google")
					.successHandler(oAuth2SuccessHandler)
					.failureHandler(oAuth2FailureHandler)
			);
	return http.build();
}

	// 2) Chain cho REST API (JWT stateless)
	@Bean
	@Order(2)
	SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
	    http
	        .securityMatcher("/apis/**","/public/**","/api/**") // Áp dụng cho tất cả API
	        .authorizeHttpRequests(auth -> auth
	        	.requestMatchers(HttpMethod.POST, "/apis/v1/reviews/service/**").authenticated()
	        	.requestMatchers(HttpMethod.GET, "/apis/v1/reviews/service/**").permitAll()
                    .requestMatchers("/public/**").permitAll()
	        	.requestMatchers(
	                    "/apis/v1/login",
	                    "/apis/v1/register",
	                    "/apis/test/**",
	                    "/apis/v1/services/**",
	                    "/apis/v1/combos/**",
	                    "/apis/dishes/all",
	                    "/apis/v1/users/forgot-password",
                        "/apis/v1/users/reset-password",
                        "/apis/v1/bookings/**",
                        "/apis/v1/admin/shifts/**"
	                ).permitAll()
                    .requestMatchers("/apis/v1/payments/callback").permitAll()
	            .anyRequest().authenticated()
	        )
	        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
	        .csrf(csrf -> csrf.disable())
	    	.cors(Customizer.withDefaults());
	
	    // ✅ add JWT filter
	    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
	
	    return http.build();
	}


	// 3) Fallback (cho phép trang gốc, tĩnh…)
	@Bean
	@Order(3)
	SecurityFilterChain fallbackChain(HttpSecurity http) throws Exception {
		http
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/", "/index.html", "/assets/**").permitAll()
						.anyRequest().permitAll()
				)
				.csrf(csrf -> csrf.disable());
		return http.build();
	}


	@Bean
    CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:3000"); // domain ReactJS
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

	@Bean
	AuthTokenFilter authenticationJwtTokenFilter() {
		return new AuthTokenFilter();
	}

	@Bean
	PasswordEncoder getPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}
	@Bean
	 ModelMapper modelMapper() {
	    return new ModelMapper();
	}

	
	@Bean
	AuthenticationManager authenticationManager() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
		authProvider.setPasswordEncoder(getPasswordEncoder());
		return new ProviderManager(authProvider);
	}
}