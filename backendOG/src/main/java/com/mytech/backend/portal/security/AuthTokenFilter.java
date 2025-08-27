package com.mytech.backend.portal.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

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

import com.mytech.backend.portal.jwt.JwtUtils;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Order(1)
public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AppUserDetailsService userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        String authHeader = request.getHeader("Authorization");

        return path.startsWith("/apis/v1/login")
                || path.startsWith("/apis/v1/register")
                || path.startsWith("/oauth2")
                || path.startsWith("/login")
                // cho phép /me nếu không có token
                || (path.startsWith("/apis/v1/users/me") && (authHeader == null || !authHeader.startsWith("Bearer ")));
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
                Object rolesObj = claims.get("roles");
                List<String> roles;

                if (rolesObj instanceof List<?>) {
                    roles = ((List<?>) rolesObj).stream()
                            .map(Object::toString)
                            .collect(Collectors.toList());
                } else if (rolesObj instanceof String) {
                    roles = List.of(rolesObj.toString());
                } else {
                    roles = List.of();
                }


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
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            // Extract token and remove any extra spaces
            String token = headerAuth.substring(7).trim();
            if (token.startsWith("Bearer ")) {
                token = token.substring(7).trim(); // Handle case of double "Bearer "
            }
            System.out.println("Parsed JWT token: " + (token.length() > 10 ? token.substring(0, 10) + "..." : token));
            return token.isEmpty() ? null : token;
        }
        return null;
    }
}