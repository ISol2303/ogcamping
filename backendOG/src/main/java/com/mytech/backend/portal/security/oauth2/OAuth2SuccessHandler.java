package com.mytech.backend.portal.security.oauth2;

import com.mytech.backend.portal.jwt.JwtUtils;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.User.User;

import com.mytech.backend.portal.repositories.CustomerRepository;
import com.mytech.backend.portal.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashMap;
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
        String registrationId = ((OAuth2AuthenticationToken) authentication)
                .getAuthorizedClientRegistrationId(); // "google" | "facebook"

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String firstName = oAuth2User.getAttribute("given_name");   // Google only
        String lastName = oAuth2User.getAttribute("family_name");   // Google only
        String picture = null;

        if ("google".equalsIgnoreCase(registrationId)) {
            // Google: lấy avatar trực tiếp
            picture = oAuth2User.getAttribute("picture");

        } else if ("facebook".equalsIgnoreCase(registrationId)) {
            // Facebook: fallback email nếu null
            if (email == null) {
                String fbId = oAuth2User.getAttribute("id");
                email = fbId + "@facebook.com"; // dùng ID để tạo email giả
            }

            // Facebook: lấy avatar từ picture.data.url
            Map<String, Object> pictureObj = oAuth2User.getAttribute("picture");
            if (pictureObj != null) {
                Map<String, Object> data = (Map<String, Object>) pictureObj.get("data");
                if (data != null) {
                    picture = (String) data.get("url");
                }
            }
        }

        // Tìm user theo email
        String finalPicture = picture;
        String finalEmail = email;
        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            // --- 1. Tạo User ---
            User newUser = User.builder()
                    .email(finalEmail)
                    .name(name)
                    .avatar(finalPicture)
                    .role(User.Role.CUSTOMER)
                    .status(User.Status.ACTIVE)
                    .provider("google".equalsIgnoreCase(registrationId) 
                            ? User.Provider.GOOGLE 
                            : User.Provider.FACEBOOK)
                    .build();
            newUser = userRepository.save(newUser);

            // --- 2. Tạo Customer gắn với User ---
            Customer newCustomer = Customer.builder()
                    .name(name)
                    .email(finalEmail)
                    .avatar(finalPicture)
                    .user(newUser)
                    .build();
            customerRepository.save(newCustomer);

            return newUser;
        });
     // --- Kiểm tra provider lock ---
        User.Provider loginProvider = "google".equalsIgnoreCase(registrationId)
                ? User.Provider.GOOGLE
                : User.Provider.FACEBOOK;

        if (user.getProvider() != loginProvider) {
            // Nếu provider khác -> từ chối login
            throw new RuntimeException("Bạn đã đăng ký bằng " + user.getProvider() +
                    ". Vui lòng đăng nhập bằng " + user.getProvider() + ".");
        }

        // --- 3. Update avatar nếu login lại bằng FB/Google ---
        if (finalPicture != null) {
            if (user.getAvatar() == null) {
                user.setAvatar(finalPicture);
                userRepository.save(user);
            }

            // Cập nhật avatar cho Customer
            customerRepository.findByUser(user).ifPresent(customer -> {
                if (customer.getAvatar() == null) {
                    customer.setAvatar(finalPicture);
                    customerRepository.save(customer);
                }
            });
        }

        // --- 4. Tạo JWT token ---
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole() != null ? user.getRole().name() : "CUSTOMER");
        if (user.getName() != null) claims.put("name", user.getName()); // 
        if (user.getAvatar() != null) claims.put("avatar", user.getAvatar());

        String token = jwtUtils.generateToken(user.getEmail(), claims);

        // --- 5. Redirect về frontend ---
        String targetUrl = UriComponentsBuilder.fromHttpUrl(redirectSuccess)
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
