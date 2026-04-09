package com.algolog.auth;

import com.algolog.auth.dto.AuthResponse;
import com.algolog.auth.dto.LoginRequest;
import com.algolog.auth.dto.RegisterRequest;
import com.algolog.user.UserService;
import com.algolog.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(userService.toDto(userService.findById(userId)));
    }

    @GetMapping("/oauth2/authorization/{provider}")
    public ResponseEntity<Void> oauth2Login(@PathVariable String provider) {
        // This endpoint is handled by Spring Security OAuth2
        // It redirects to the OAuth provider (Google or GitHub)
        return ResponseEntity.status(HttpStatus.FOUND).build();
    }
}
