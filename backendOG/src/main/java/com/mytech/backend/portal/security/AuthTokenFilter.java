package com.mytech.backend.portal.security;

import com.mytech.backend.portal.jwt.JwtUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Order(1)
public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AppUserDetailsService userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

//    @Override
//    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
//      String path = request.getServletPath();
//      System.out.println("------------shouldNotFilter------------" + path);
//      return path.startsWith("/apis/v1/login") || path.startsWith("/apis/v1/register");
//    }
@Override
protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String path = request.getServletPath();
    System.out.println("------------shouldNotFilter------------" + path);

    return path.startsWith("/apis/v1/login")
            || path.startsWith("/apis/v1/register")
            || path.startsWith("/oauth2")
            || path.startsWith("/login");
}

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("doFilterInternal::");

        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                Claims claims = jwtUtils.getClaimsFromJwtToken(jwt);
                List<String> roles = claims.get("roles", List.class); // Retrieve roles as a List

                AppUserDetails userDetails = (AppUserDetails) userDetailsService.loadUserByUsername(username);

                // Convert roles from JWT to Spring Security authorities
                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                System.out.println("subject: " + username);
                System.out.println("claims roles: " + roles);
                System.out.println("userDetails roles: " + userDetails.roles());

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
    	String headerAuth = request.getHeader("Authorization");
    	if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
    	    String token = headerAuth.substring(7).trim();
    	    if (token.startsWith("Bearer ")) { // Xóa Bearer thừa
    	        token = token.substring(7).trim();
    	    }
    	    // validate token
    	}

        return null;
    }
}