package com.mytech.backend.portal.security.oauth2;

import com.mytech.backend.portal.jwt.JwtUtils;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.repositories.CustomerRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @Value("${app.oauth2.redirect-success}")
    private String redirectSuccess;
@Override
public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                    Authentication authentication) throws IOException {
    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

    String googleId = oAuth2User.getAttribute("sub");
    String email = oAuth2User.getAttribute("email");
    String name = oAuth2User.getAttribute("name");
    String firstName = oAuth2User.getAttribute("given_name");   // Google: given_name = firstName
    String lastName = oAuth2User.getAttribute("family_name");   // Google: family_name = lastName
    String picture = oAuth2User.getAttribute("picture");

    // Tìm user theo email
    User user = userRepository.findByEmail(email).orElseGet(() -> {
        // --- 1. Tạo User ---
        User newUser = User.builder()
                .googleId(googleId)
                .email(email)
                .name(name)
                .avatar(picture)
                .role(User.Role.CUSTOMER)
                .status(User.Status.ACTIVE)
                .build();
        newUser = userRepository.save(newUser);

        // --- 2. Tạo Customer tương ứng ---
        Customer customer = Customer.builder()
                .firstName(firstName != null ? firstName : name)
                .lastName(lastName != null ? lastName : "")
                .email(email)
                .phone("")
                .address("")
                .user(newUser)
                .build();
        customerRepository.save(customer);

        return newUser;
    });

    // --- 3. Tạo JWT token ---
    String token = jwtUtils.generateToken(
            user.getEmail(),
            Map.of("role", user.getRole().name())
    );

    // --- 4. Redirect về frontend ---
    String targetUrl = UriComponentsBuilder.fromHttpUrl(redirectSuccess)
            .queryParam("token", token)
            .build().toUriString();

    getRedirectStrategy().sendRedirect(request, response, targetUrl);
}

}