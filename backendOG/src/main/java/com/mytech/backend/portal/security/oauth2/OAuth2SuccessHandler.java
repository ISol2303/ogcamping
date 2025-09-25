package com.mytech.backend.portal.security.oauth2;

import com.mytech.backend.portal.jwt.JwtUtils;
import com.mytech.backend.portal.models.Customer.Customer;
import com.mytech.backend.portal.models.User.User;
import com.mytech.backend.portal.models.UserProvider.UserProvider;
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
                .getAuthorizedClientRegistrationId(); // "google" | "facebook" | ...

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String firstName = oAuth2User.getAttribute("given_name");   // Google only
        String lastName = oAuth2User.getAttribute("family_name");   // Google only
        String picture = null;

        if ("google".equalsIgnoreCase(registrationId)) {
            picture = oAuth2User.getAttribute("picture");
        } else if ("facebook".equalsIgnoreCase(registrationId)) {
            if (email == null) {
                String fbId = oAuth2User.getAttribute("id");
                email = fbId + "@facebook.com";
            }
            Map<String, Object> pictureObj = oAuth2User.getAttribute("picture");
            if (pictureObj != null) {
                Map<String, Object> data = (Map<String, Object>) pictureObj.get("data");
                if (data != null) {
                    picture = (String) data.get("url");
                }
            }
        }

        // ==== LẤY providerId MỘT CÁCH AN TOÀN ====
        String providerId = extractProviderId(oAuth2User);
        // Nếu vẫn null thì ném lỗi rõ ràng (DB không chấp nhận provider_id = null)
        if (providerId == null) {
            throw new RuntimeException("Không tìm thấy provider id (sub/id/...) trong OAuth2User attributes. Attributes = "
                    + oAuth2User.getAttributes().keySet());
        }

        String providerName = registrationId != null ? registrationId.toLowerCase() : "unknown";
        UserProvider.Provider providerEnum = mapToProviderEnum(providerName);

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
                    .build();

            // Tạo provider liên quan cho user (bắt buộc có providerId)
            UserProvider provider = UserProvider.builder()
                    .provider(providerEnum)
                    .providerId(providerId)
                    .user(newUser)
                    .build();
            newUser.getProviders().add(provider);

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

        // --- kiểm tra nếu user đã tồn tại nhưng chưa có provider này (với cùng providerId) thì link thêm ---
        boolean hasProvider = user.getProviders().stream()
                .anyMatch(p -> p != null && p.getProvider() == providerEnum && providerId.equals(p.getProviderId()));

        if (!hasProvider) {
            UserProvider provider = UserProvider.builder()
                    .provider(providerEnum)
                    .providerId(providerId)
                    .user(user)
                    .build();
            user.getProviders().add(provider);
            userRepository.save(user);
        }

        // --- Update avatar nếu cần ---
        if (finalPicture != null) {
            boolean needSaveUser = false;
            if (user.getAvatar() == null) {
                user.setAvatar(finalPicture);
                needSaveUser = true;
            }
            if (needSaveUser) userRepository.save(user);

            customerRepository.findByUser(user).ifPresent(customer -> {
                if (customer.getAvatar() == null) {
                    customer.setAvatar(finalPicture);
                    customerRepository.save(customer);
                }
            });
        }

        // --- Tạo JWT ---
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole() != null ? user.getRole().name() : "CUSTOMER");
        claims.put("id", user.getId());
        if (user.getName() != null) claims.put("name", user.getName());
        if (user.getAvatar() != null) claims.put("avatar", user.getAvatar());

        String token = jwtUtils.generateToken(user.getEmail(), claims);

        // --- Redirect ---
        String targetUrl = UriComponentsBuilder.fromHttpUrl(redirectSuccess)
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * Thử nhiều key thường gặp để lấy providerId (Google OIDC trả về 'sub', Facebook trả 'id', ...)
     */
    private String extractProviderId(OAuth2User user) {
        if (user == null) return null;
        Object v;
        v = user.getAttribute("sub");
        if (v != null) return v.toString();
        v = user.getAttribute("id");
        if (v != null) return v.toString();
        v = user.getAttribute("user_id");
        if (v != null) return v.toString();
        v = user.getAttribute("uid");
        if (v != null) return v.toString();
        v = user.getAttribute("openid");
        if (v != null) return v.toString();
        // thêm keys khác nếu provider của bạn dùng tên khác
        return null;
    }

    private UserProvider.Provider mapToProviderEnum(String registrationId) {
        if (registrationId == null) throw new RuntimeException("Null provider");
        switch (registrationId.toLowerCase()) {
            case "google":
                return UserProvider.Provider.GOOGLE;
            case "facebook":
                return UserProvider.Provider.FACEBOOK;
            default:
                throw new RuntimeException("Unsupported provider: " + registrationId +
                        ". Thêm mapping tương ứng trong mapToProviderEnum().");
        }
    }
}
