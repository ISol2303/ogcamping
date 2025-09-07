package com.mytech.backend.portal.jwt;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
	@Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Jws<Claims> jws = Jwts.parserBuilder()
                        .setSigningKey(Keys.hmacShaKeyFor(
                                System.getenv().getOrDefault("APP_JWT_SECRET", "change-this-to-512bit-secret")
                                        .getBytes(StandardCharsets.UTF_8)))
                        .build()
                        .parseClaimsJws(token);

                String email = jws.getBody().getSubject();
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) jws.getBody().get("roles");

                List<GrantedAuthority> authorities = roles == null ? List.of()
                        : roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException ex) {
                // token hỏng/hết hạn -> bỏ qua để 401
            }
        }
        chain.doFilter(request, response);
    }
}
