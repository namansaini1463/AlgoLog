package com.algolog.auth;

import com.algolog.auth.dto.AuthResponse;
import com.algolog.auth.dto.LoginRequest;
import com.algolog.auth.dto.RegisterRequest;
import com.algolog.category.UserCategoryService;
import com.algolog.user.User;
import com.algolog.user.UserRepository;
import com.algolog.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final UserCategoryService userCategoryService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.admin.email}")
    private String adminEmail;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        String role = request.getEmail().equalsIgnoreCase(adminEmail)
                ? "ROLE_ADMIN" : "ROLE_USER";

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        user = userRepository.save(user);

        // Seed default categories (DSA, LLD, HLD) for the new user
        userCategoryService.seedDefaults(user.getId());

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .user(userService.toDto(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Check if this is an OAuth user trying to login with password
        if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
            throw new IllegalArgumentException("This account uses " + user.getOauthProvider() + 
                " login. Please use the 'Continue with " + 
                capitalizeFirst(user.getOauthProvider()) + "' button.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .user(userService.toDto(user))
                .build();
    }

    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
