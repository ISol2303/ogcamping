package com.mytech.backend.portal.jwt;

import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.security.AppUserDetails;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtils {
	private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
	@Value("${app.jwtSecret}")
	private String jwtSecret;

	@Value("${app.jwtExpirationMs}")
	private long jwtExpirationMs;

	private Key key() {
		return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
	}

	public String generateToken(String subject, Map<String, Object> claims) {
		long now = System.currentTimeMillis();
		return Jwts.builder()
				.setSubject(subject) // thường là userId hoặc email
				.addClaims(claims)
				.setIssuedAt(new Date(now))
				.setExpiration(new Date(now + jwtExpirationMs))
				.signWith(key(), SignatureAlgorithm.HS512)
				.compact();
	}

	// Dùng cho login username/password
	public String generateJwtToken(Authentication authentication) {
		AppUserDetails userPrincipal = (AppUserDetails) authentication.getPrincipal();

		return Jwts.builder()
				.setSubject(userPrincipal.getUsername())
				.setIssuedAt(new Date())
				.setIssuer("TheApartment")
				.claim("roles", userPrincipal.roles())
				.setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
				.signWith(key(), SignatureAlgorithm.HS256)
				.compact();
	}

	// Lấy username/email từ token
	public String getUserNameFromJwtToken(String token) {
		return Jwts.parserBuilder().setSigningKey(key()).build()
				.parseClaimsJws(token).getBody().getSubject();
	}

	// Lấy tất cả claims
	public Claims getClaimsFromJwtToken(String token) {
		return Jwts.parserBuilder().setSigningKey(key()).build()
				.parseClaimsJws(token).getBody();
	}

	// Validate token
	public boolean validateJwtToken(String authToken) {
		try {
			Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
			return true;
		} catch (MalformedJwtException e) {
			logger.error("Invalid JWT token: {}", e.getMessage());
		} catch (ExpiredJwtException e) {
			logger.error("JWT token is expired: {}", e.getMessage());
		} catch (UnsupportedJwtException e) {
			logger.error("JWT token is unsupported: {}", e.getMessage());
		} catch (IllegalArgumentException e) {
			logger.error("JWT claims string is empty: {}", e.getMessage());
		}

		return false;
	}
}
