package com.mytech.backend.portal.apis;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.backend.portal.dto.SignInRequest;
import com.mytech.backend.portal.dto.SignInResponse;
import com.mytech.backend.portal.dto.SignUpRequest;
import com.mytech.backend.portal.jwt.JwtUtils;
import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.services.UserService;

@RestController
@RequestMapping("/apis/**")
public class AppRestController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping({"/v1/login", "/test/login"}) // Support both /v1/login and /test/login
    public ResponseEntity<?> signIn(@RequestBody SignInRequest signInRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            signInRequest.getEmail(), signInRequest.getPassword()));

            User user = userService.findByEmail(signInRequest.getEmail());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Tài khoản không tồn tại.");
            }

            String token = jwtUtils.generateJwtToken(authentication);

            SignInResponse signInResponse = new SignInResponse();
            signInResponse.setEmail(user.getEmail());
            signInResponse.setFullname(user.getName());
            signInResponse.setRole(user.getRole());
            signInResponse.setTokenType("Bearer");
            signInResponse.setToken(token);

            return ResponseEntity.ok(signInResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Email hoặc mật khẩu không đúng.");
        }
    }
    @GetMapping("/user")
    public ResponseEntity<?> getUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Không được phép truy cập.");
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Người dùng không tồn tại.");
        }

        // Map to frontend-compatible User response
        return ResponseEntity.ok(new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name()
           
        ));
    }
    // Register endpoint remains unchanged
    @PostMapping({"/v1/register", "/test/register"})
    public ResponseEntity<?> register(@RequestBody SignUpRequest signUpRequest) {
        User existingUser = userService.findByEmail(signUpRequest.getEmail());

        if (existingUser != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ Email đã được đăng ký.");
        }

        User newUser = new User();
        newUser.setEmail(signUpRequest.getEmail());
        newUser.setName(signUpRequest.getName());
        newUser.setPhone(signUpRequest.getPhone());
        newUser.setPassword(new BCryptPasswordEncoder().encode(signUpRequest.getPassword()));
        newUser.setRole(User.Role.CUSTOMER);

        userService.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body("✅ Đăng ký thành công.");
    }
}